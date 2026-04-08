import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/dashboard/settings");
  }

  return (
    <SettingsClient
      user={{
        name: session.user.name ?? "",
        email: session.user.email,
        image: session.user.image ?? undefined,
      }}
    />
  );
}
