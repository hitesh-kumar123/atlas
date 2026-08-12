import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { basePrisma } from "./prisma";
import { getMembershipsForUser, isUserMemberOfTenant } from "./auth-queries";
import { loginSchema } from "./validation";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      activeTenantId: string | null;
      role: "owner" | "admin" | "viewer" | null;
    };
  }
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await basePrisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;

        const valid = await argon2.verify(user.passwordHash, parsed.data.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        const memberships = await getMembershipsForUser(user.id!);
        token.activeTenantId = memberships[0]?.tenantId ?? null;
        token.role = memberships[0]?.role ?? null;
      }

      if (trigger === "update" && session?.activeTenantId) {
        const ok = await isUserMemberOfTenant(token.userId as string, session.activeTenantId);
        if (ok) {
          const memberships = await getMembershipsForUser(token.userId as string);
          const match = memberships.find((m) => m.tenantId === session.activeTenantId);
          token.activeTenantId = session.activeTenantId;
          token.role = match?.role ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.activeTenantId = (token.activeTenantId as string | null) ?? null;
      session.user.role = (token.role as "owner" | "admin" | "viewer" | null) ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
