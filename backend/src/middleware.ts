import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Handle CORS preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, Idempotency-Key",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Handle standard requests
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, Idempotency-Key");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
