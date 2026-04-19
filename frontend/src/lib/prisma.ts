import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  console.error("🚨 ALERT: Next.js cannot see the .env file!");
  throw new Error("CRITICAL: DATABASE_URL is missing. Stopping server to prevent localhost default.");
}


// Set up WebSocket for Neon to bypass mobile hotspot firewalls
neonConfig.webSocketConstructor = ws;

// Grab your Neon connection string from .env
const connectionString = `${process.env.DATABASE_URL}`;

// Initialize the Neon pool and Prisma adapter
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as any);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // <-- This fixes the PrismaClientConstructorValidationError!
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;