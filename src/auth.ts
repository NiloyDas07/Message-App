import { authOptions } from "./app/api/auth/[...nextauth]/options";

import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
