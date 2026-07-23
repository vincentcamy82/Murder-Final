import { NextResponse } from "next/server";
import { getSiteRecord, serializeSite } from "@/lib/server/data";
import { handler } from "@/lib/server/http";

export const GET = handler(async () => {
  return NextResponse.json(serializeSite(await getSiteRecord()));
});
