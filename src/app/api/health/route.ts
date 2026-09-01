import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const dbUrlPreview = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@")
    : null;

  try {
    await db.execute(sql`select 1 as ok`);
    return Response.json({
      status: "healthy",
      database: "connected",
      hasDbUrl,
      dbUrlPreview,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = typeof err === "object" && err !== null && "code" in err ? (err as { code: unknown }).code : undefined;
    return Response.json(
      {
        status: "error",
        database: "disconnected",
        errorMessage: message,
        errorCode: code,
        hasDbUrl,
        dbUrlPreview,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

