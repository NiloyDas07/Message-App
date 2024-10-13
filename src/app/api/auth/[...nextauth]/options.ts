import { CredentialsSignin, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";

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
      async authorize(credentials: any): Promise<any> {
        // Connect to db.
        await dbConnect();

        try {
          // Check if user account exists.
          console.log("credentials: ", credentials);
          const user = await User.findOne({
            $or: [
              { email: credentials?.identifier },
              { username: credentials?.identifier },
            ],
          });

          // If user not found.
          if (!user) {
            throw new InvalidCredentialsError();
          }

          // If user is not verified.
          if (!user.isVerified) {
            throw new Error("Please verify your email to login.");
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordMatch) {
            throw new InvalidCredentialsError();
          }

          return user;
        } catch (error) {
          console.log("error: ", error);
          throw new InvalidCredentialsError();
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
