/**
 * Database Layer — Prisma + PostgreSQL (Supabase)
 *
 * Setup (after DATABASE_URL is set in .env):
 *   npx prisma generate    # generate Prisma client
 *   npx prisma migrate dev # run migrations
 */

import type { PrismaClient as PrismaClientType } from "@prisma/client";
import type { Project, User } from "@prisma/client";

let _prisma: PrismaClientType | null = null;

// System user ID used when auth is not yet wired
const SYSTEM_USER_ID = "system-user";

async function getPrisma(): Promise<PrismaClientType> {
  if (_prisma) return _prisma;
  const { PrismaClient } = await import("@prisma/client");
  _prisma = new PrismaClient();
  return _prisma;
}

// ─── User CRUD ──────────────────────────────────────────

export async function dbUpsertUser({
  email,
  name,
  image,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<User> {
  const prisma = await getPrisma();
  return prisma.user.upsert({
    where: { email },
    update: { name, image },
    create: { email, name, image, plan: "free" },
  });
}

export async function dbGetUser(email: string): Promise<User | null> {
  const prisma = await getPrisma();
  return prisma.user.findUnique({ where: { email } });
}

export async function dbGetUserByCustomerId(stripeCustomerId: string): Promise<User | null> {
  const prisma = await getPrisma();
  return prisma.user.findUnique({ where: { stripeCustomerId } });
}

export async function dbUpdateUserPlan(
  email: string,
  stripeCustomerId: string,
  plan: "free" | "maker" | "studio"
): Promise<void> {
  const prisma = await getPrisma();
  await prisma.user.update({
    where: { email },
    data: { stripeCustomerId, plan },
  });
}

// ─── Project CRUD ────────────────────────────────────────

export async function dbCreateProject({
  name,
  userId,
}: {
  name: string;
  userId?: string;
}): Promise<Project> {
  const prisma = await getPrisma();
  const uid = userId ?? SYSTEM_USER_ID;
  return prisma.project.create({
    data: {
      name,
      userId: uid,
      status: "idle",
      events: [],
    },
  });
}

export async function dbGetProject(id: string): Promise<Project | null> {
  const prisma = await getPrisma();
  return prisma.project.findUnique({ where: { id } });
}

export async function dbGetAllProjects(opts?: { userId?: string }): Promise<Project[]> {
  const prisma = await getPrisma();
  const where = opts?.userId ? { userId: opts.userId } : {};
  return prisma.project.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function dbUpdateProject(
  id: string,
  data: Partial<Project>
): Promise<Project> {
  const prisma = await getPrisma();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.project.update({ where: { id }, data: data as any });
}

export async function dbDeleteProject(id: string): Promise<void> {
  const prisma = await getPrisma();
  await prisma.project.delete({ where: { id } });
}

// ─── Connection management ────────────────────────────────

export async function dbConnect(): Promise<void> {
  const prisma = await getPrisma();
  await prisma.$connect();
}

// ─── Waitlist ──────────────────────────────────────────────────

export async function dbAddWaitlistEntry(email: string): Promise<void> {
  const prisma = await getPrisma();
  await prisma.waitlist.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}

export async function dbGetWaitlistCount(): Promise<number> {
  const prisma = await getPrisma();
  return prisma.waitlist.count();
}

export async function dbDisconnect(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
}
