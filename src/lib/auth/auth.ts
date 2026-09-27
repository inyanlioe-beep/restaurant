import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/data/prisma";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Instant fallback for demo accounts
        const demoAccounts: Record<string, { pass: string; role: string; name: string }> = {
          "admin@restaurant.com": { pass: "Admin123!", role: "SUPER_ADMIN", name: "Alexander Vance" },
          "manager@restaurant.com": { pass: "Manager123!", role: "MANAGER", name: "Elena Rostova" },
          "waiter@restaurant.com": { pass: "Staff123!", role: "WAITER", name: "Marcus Cole" },
          "chef@restaurant.com": { pass: "Chef123!", role: "CHEF", name: "Chef Jean-Luc" },
        };

        const demo = demoAccounts[email.toLowerCase()];
        if (demo && password === demo.pass) {
          return {
            id: `user-${demo.role.toLowerCase()}`,
            name: demo.name,
            email: email.toLowerCase(),
            role: demo.role,
            branchId: "branch-main-1",
          };
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user || !user.isActive || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: user.branchId || undefined,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.branchId = (user as { branchId?: string }).branchId;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { role: string }).role = token.role as string;
        (session.user as unknown as { branchId?: string }).branchId = token.branchId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "restaurant-super-secret-key-change-in-production-12345678",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
