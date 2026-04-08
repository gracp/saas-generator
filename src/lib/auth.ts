import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbUpsertUser } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? "";
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Persist user to DB on OAuth sign-in
        await dbUpsertUser({
          email: user.email ?? "",
          name: user.name,
          image: user.image,
        }).catch((err) => console.error("[DB] Failed to upsert user on sign-in:", err));
        return true;
      }
      return false;
    },
  },
};

export default NextAuth(authOptions);
