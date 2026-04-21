import { NextResponse } from "next/server";

/**
 * Vercel Cron Job — calls the backend refresh endpoint daily at 3am UTC.
 * Configured in vercel.json: {"crons": [{"path": "/api/cron/refresh", "schedule": "0 3 * * *"}]}
 */
export async function GET(request: Request) {
  // Verify Vercel cron signature in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "/_/backend";
    const secret = process.env.CRON_SECRET || "";
    const res = await fetch(
      `${backendUrl}/api/admin/refresh-db?secret=${encodeURIComponent(secret)}`,
      { method: "GET", cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("[Cron] Refresh failed:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
