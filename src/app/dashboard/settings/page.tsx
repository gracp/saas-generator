import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { dbGetUser, dbGetAllProjects } from "@/lib/db";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/dashboard/settings");
  }

  // Fetch full user record from DB for stripeCustomerId and plan
  const dbUser = await dbGetUser(session.user.email);
  const projects = dbUser
    ? await dbGetAllProjects({ userId: dbUser.id })
    : [];

  return (
    <SettingsClient
      user={{
        name: session.user.name ?? "",
        email: session.user.email,
        image: session.user.image ?? undefined,
      }}
      stripeCustomerId={dbUser?.stripeCustomerId ?? null}
      plan={(dbUser?.plan as "free" | "hobby" | "maker" | "studio") ?? "free"}
      projects={projects.map((p) => ({ id: p.id, name: p.name, status: p.status }))}
    />
  );
}
