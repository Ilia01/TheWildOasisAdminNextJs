import NextAuth, { NextAuthConfig } from "next-auth";
import { Prisma } from "@prisma/client";
import prisma from "./db";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password)
            throw new Error("Both credentials are required");

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user) throw new Error("User not registered");

          const isPasswordValid = await compare(
            credentials.password as string,
            user.password,
          );

          if (!isPasswordValid) throw new Error("Invalid password");

          return {
            id: user.id + "",
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error(error);
          if (error) throw new Error(error?.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Prisma.UserCreateInput;
        return {
          ...token,
          id: u.id,
        };
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
