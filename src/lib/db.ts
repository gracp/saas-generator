/**
 * Database Layer — Prisma + PostgreSQL (Supabase)
 *
 * Setup:
 *   1. npm install
 *   2. npx prisma generate       # generate Prisma client
 *   3. npx prisma migrate dev    # run migrations (requires DATABASE_URL)
 *
 * The DB layer is a drop-in replacement for the in-memory Map in projects.ts.
 * Set DATABASE_URL in .env to enable persistence.
 */

import type { PrismaClient as PrismaClientType } from "@prisma/client";

let _prisma: PrismaClientType | null = null;

async function getPrisma(): Promise<PrismaClientType> {
  if (_prisma) return _prisma;
  const { PrismaClient } = await import("@prisma/client");
  _prisma = new PrismaClient();
  return _prisma;
}

// ─── Project CRUD ────────────────────────────────────────

export async function dbCreateProject(name: string) {
  const prisma = await getPrisma();
  return prisma.project.create({
    data: {
      name,
      status: "idle",
      events: { createdAt: new Date().toISOString(), type: "info", message: "Project created" },
    },
  });
}

export async function dbGetProject(id: string) {
  const prisma = await getPrisma();
  return prisma.project.findUnique({ where: { id } });
}

export async function dbGetAllProjects() {
  const prisma = await getPrisma();
  return prisma.project.findMany({ orderBy: { createdAt: "desc" } });
}

export async function dbUpdateProject(id: string, data: Record<string, unknown>) {
  const prisma = await getPrisma();
  return prisma.project.update({ where: { id }, data: data as Parameters<typeof prisma.project.update>[0]["data"] });
}

export async function dbDeleteProject(id: string) {
  const prisma = await getPrisma();
  return prisma.project.delete({ where: { id } });
}

export async function dbAddEvent(
  id: string,
  message: string,
  type: "info" | "success" | "warning" | "error"
) {
  const project = await dbGetProject(id);
  if (!project) return;
  const events = (project.events as Array<{ type: string; message: string; timestamp: string }>) ?? [];
  events.push({ type, message, timestamp: new Date().toISOString() });
  return dbUpdateProject(id, { events });
}

export async function dbConnect() {
  const prisma = await getPrisma();
  await prisma.$connect();
}

export async function dbDisconnect() {
  if (_prisma) {
    await (_prisma as PrismaClientType).$disconnect();
  }
}
