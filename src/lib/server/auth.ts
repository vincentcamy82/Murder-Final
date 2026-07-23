import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import type { Role } from "@/types";
import { ApiError } from "./http";

export interface Identity {
  role: Role;
  character_id?: string;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-murder-party-1900");
}

export async function createToken(payload: Identity, days = 30): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${days}d`)
    .sign(secretKey());
}

export async function decodeToken(token: string): Promise<Identity> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as Identity;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "ERR_JWT_EXPIRED") throw new ApiError(401, "Session expirée");
    throw new ApiError(401, "Jeton invalide");
  }
}

export function tokenFromRequest(request: NextRequest): string {
  const auth = request.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  throw new ApiError(401, "Non authentifié");
}

export async function getIdentity(request: NextRequest): Promise<Identity> {
  return decodeToken(tokenFromRequest(request));
}

export async function requireAdmin(request: NextRequest): Promise<Identity> {
  const identity = await getIdentity(request);
  if (identity.role !== "admin") throw new ApiError(403, "Accès administrateur requis");
  return identity;
}
