import { NextResponse, type NextRequest } from "next/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}

export function handler<C = unknown>(
  fn: (request: NextRequest, context: C) => Promise<Response>,
) {
  return async (request: NextRequest, context: C): Promise<Response> => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ detail: error.detail }, { status: error.status });
      }
      console.error(error);
      return NextResponse.json({ detail: "Erreur interne du serveur" }, { status: 500 });
    }
  };
}
