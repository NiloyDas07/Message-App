"use client";

import Link from "next/link";

import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const { data: session } = useSession();

  const user: User | undefined = session?.user;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-background">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <Link className="text-xl font-bold md:mb-0 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent" href="/">
          <span className="italic ">Simple</span>
          Chat
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <span className="mr-4">
                Welcome, {user?.username || user?.email}
              </span>
              <Button className="w-full md:w-auto" onClick={() => signOut()}>
                {" "}
                Sign Out{" "}
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="w-full md:w-auto">Sign In</Button>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
