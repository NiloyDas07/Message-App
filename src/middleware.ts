import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/", "/verify/:path*"],
};

export async function middleware(request: NextRequest) {
  const session = await auth();
  const url = request.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    session?.user &&
    session.user._id && // Check for _id to ensure user is fully authenticated
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to sign-in if the user is not authenticated and trying to access dashboard
  if (!session?.user?._id && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Additional check for verified users
  if (
    session?.user &&
    !session.user.isVerified &&
    url.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  return NextResponse.next();
}
