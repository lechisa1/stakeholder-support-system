import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // 👈 add your custom token
    user?: {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
  }
}
