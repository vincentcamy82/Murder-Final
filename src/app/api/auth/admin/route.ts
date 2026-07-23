import { NextResponse } from "next/server";
import { createToken } from "@/lib/server/auth";
import { ApiError, handler } from "@/lib/server/http";

export const POST = handler(async (request) => {
  const body = (await request.json()) as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new ApiError(500, "ADMIN_PASSWORD non configuré");
  if (body.password !== adminPassword) throw new ApiError(401, "Mot de passe incorrect");
  const token = await createToken({ role: "admin" });
  return NextResponse.json({ token, role: "admin" });
});
