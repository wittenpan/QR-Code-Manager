// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../lib/db";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
        const userWithRestaurants = await prisma.user.findUnique({
          where: { id: user.id },
          include: { restaurants: true },
        });
        (session.user as any).restaurants =
          userWithRestaurants?.restaurants || [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin", // Changed from /auth/signin to /signin
    error: "/signin", // Changed from /auth/error to /signin
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
