import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";
import { compare } from "bcrypt";
import { Prisma } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("it should be working???!?!?");
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) return null;

        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id + "",
          email: user.email,
          name: user.name,
        };
      },
      // async signIn(formData) {
      //   // if (!email || !password) {
      //   //   throw new Error("Email and password are required");
      //   // }
      //   // // Fetch the user from the database
      //   // const user = await prisma.user.findUnique({
      //   //   where: { email },
      //   // });
      //   // if (!user) {
      //   //   throw new Error("User not found");
      //   // }
      //   // // Validate the password
      //   // const isPasswordValid = await compare(password, user.password);
      //   // if (!isPasswordValid) {
      //   //   throw new Error("Invalid password");
      //   // }
      //   // // Generate a JWT token (or any session-related response based on your `authorize` logic)
      //   // const sessionData = {
      //   //   id: user.id,
      //   //   email: user.email,
      //   //   name: user.name,
      //   // };
      //   // return sessionData; // Pass this to your client or further processing
      // },
    }),
  ],
  pages: {
    signIn: "/",
    // error: "/error",
  },
  callbacks: {
    // async redirect({ url, baseUrl }) {
    //   if (url === baseUrl) {
    //     return `${baseUrl}/authenticated/dashboard`;
    //   }
    //   return url;
    // },
    session({ session, token }) {
      console.log("session", { session, token });
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
    jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Prisma.UserCreateInput;
        return {
          ...token,
          id: u.id,
        };
      }
      return token;
    },
  },
};

export const { handler, auth, signIn, signOut } = NextAuth(authOptions);
export { handler as GET, handler as POST };
