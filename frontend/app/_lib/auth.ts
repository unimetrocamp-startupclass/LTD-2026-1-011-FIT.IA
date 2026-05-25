import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";

import { prisma } from "./db";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
const apiURL = process.env.NEXT_PUBLIC_API_URL;
const secret = process.env.BETTER_AUTH_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!baseURL) throw new Error("NEXT_PUBLIC_BASE_URL is required");
if (!apiURL) throw new Error("NEXT_PUBLIC_API_URL is required");
if (!secret) throw new Error("BETTER_AUTH_SECRET is required");
if (!googleClientId) throw new Error("GOOGLE_CLIENT_ID is required");
if (!googleClientSecret) throw new Error("GOOGLE_CLIENT_SECRET is required");

export const auth = betterAuth({
  baseURL,
  secret,
  trustedOrigins: [baseURL],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
  plugins: [
    jwt({
      jwt: {
        issuer: baseURL,
        audience: apiURL,
        expirationTime: "15m",
      },
    }),
  ],
});
