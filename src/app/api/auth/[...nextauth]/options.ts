import { CredentialsSignin, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import axios, { AxiosError } from "axios";

// Custom Error Message
class InvalidCredentialsError extends CredentialsSignin {
  code: string;

  constructor() {
    super();
    this.code = "Invalid Credentials";
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Email / Username",
          type: "text",
          placeholder: "email / username",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(
            `${process.env.NEXTAUTH_URL}/api/sign-in`,
            {
              identifier: credentials?.identifier,
              password: credentials?.password,
            }
          );

          return response.data?.user;
        } catch (error) {
          const axiosError = error as AxiosError;

          if (axiosError.response?.status === 401) {
            throw new InvalidCredentialsError();
          }

          console.error("Sign In Error: ", error);

          throw new Error("Failed to sign in.");
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token._id = user._id?.toString();
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user._id = token._id as string;
        session.user.username = token.username as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
