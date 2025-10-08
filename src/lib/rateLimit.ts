import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

export function rateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const userRequests = rateLimitMap.get(ip);

  if (!userRequests || userRequests.resetTime < windowStart) {
    // First request or window expired
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return null;
  }

  if (userRequests.count >= MAX_REQUESTS) {
    const resetTime = Math.ceil((userRequests.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": resetTime.toString(),
          "X-RateLimit-Limit": MAX_REQUESTS.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": userRequests.resetTime.toString(),
        },
      }
    );
  }

  userRequests.count++;
  return null;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (data.resetTime < now) {
      rateLimitMap.delete(ip);
    }
  }
}, WINDOW_MS);