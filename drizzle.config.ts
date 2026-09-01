import { defineConfig } from "drizzle-kit";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Manually parse .env.local (dotenv v17 doesn't auto-load .env.local by name)
function loadEnvFile(filePath: string) {
  const abs = resolve(filePath);
  if (!existsSync(abs)) return;
  const lines = readFileSync(abs, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Create .env.local with DATABASE_URL=postgresql://...");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
