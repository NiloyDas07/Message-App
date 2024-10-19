"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MoveLeft } from "lucide-react";
import Link from "next/link";
import { signInSchema } from "@/schemas/signIn.schema";
import { signIn } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

const page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Toast for errors and other notifications.
  const { toast } = useToast();

  // Form validation with Zod.
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Function to handle form submission.
  const handleSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(() => true);
    const response = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

    if (response?.error) {
      if (response.error === "CredentialsSignin") {
        toast({
          variant: "destructive",
          title: "Sign In failed.",
          description: "Invalid email or password.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sign In failed.",
          description: response.error,
        });
      }
    }

    if (response?.url) {
      router.back();
    }

    setIsSubmitting(() => false);
  };

  return (
    <>
      <ThemeToggle className="fixed top-4 right-4" />

      <div className="flex justify-center items-center min-h-svh bg-muted-background py-4">
        <div className="w-full max-w-md space-y-8 p-8 bg-background rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Join Messaging App
            </h1>
            <p className="mb-4">
              Sign In to start connecting with your friends and family.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Username Field */}
              <FormField
                name="identifier"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username / Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Username / Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing Up
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center mt-4">
            {/* Sign Up Link */}
            <p>
              Not a member?{" "}
              <Link
                href="/sign-up"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign Up
              </Link>
            </p>

            {/* Back to Home Link */}
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 flex text-center justify-center gap-3"
            >
              <MoveLeft></MoveLeft>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
