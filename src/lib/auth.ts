import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { basePrisma } from "./prisma";
import { getMembershipsForUser, isUserMemberOfTenant } from "./auth-queries";
import { loginSchema } from "./validation";

/**
 * Session shape: activeTenantId is the org currently selected in the UI.
 * It is set server-side (see src/actions/org.ts#switchActiveOrg) only
 * after confirming membership — never trust a tenant id that arrives
 * purely from client input. Every server action / route handler reads
 * activeTenantId from the session (not from a request body param) before
 * calling withTenant().
 */
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
        // On first login, default to the user's first tenant (if any).
        const memberships = await getMembershipsForUser(user.id!);
        token.activeTenantId = memberships[0]?.tenantId ?? null;
        token.role = memberships[0]?.role ?? null;
      }

      // Explicit, verified org switch — see src/actions/org.ts.
      if (trigger === "update" && session?.activeTenantId) {
        const ok = await isUserMemberOfTenant(token.userId as string, session.activeTenantId);
        if (ok) {
          const memberships = await getMembershipsForUser(token.userId as string);
          const match = memberships.find((m) => m.tenantId === session.activeTenantId);
          token.activeTenantId = session.activeTenantId;
          token.role = match?.role ?? null;
        }
        // If not ok: silently ignore the requested switch and keep the
        // previous activeTenantId. This is the anti-spoofing behaviour —
        // there is no code path where an unverified tenant id sticks.
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
