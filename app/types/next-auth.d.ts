// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import type { Restaurant } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      restaurants: Restaurant[];
    } & DefaultSession["user"];
  }
}
