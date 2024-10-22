"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

import { useToast } from "@/hooks/use-toast";

import { signUpSchema } from "@/schemas/signUp.schema";
import { ApiResponseInterface } from "@/types/apiResponse";
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
import { ThemeToggle } from "@/components/ThemeToggle";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debouncing the username input so that we don't send too many requests to the server.
  const debounced = useDebounceCallback(setUsername, 300);

  const router = useRouter();

  // Toast for errors and other notifications.
  const { toast } = useToast();

  // Form validation with Zod.
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Continuously check if the username is unique.
  useEffect(() => {
    // Function to check if the username is unique.
    const isUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");

        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`
          );

          console.log("response: ", response);

          if (response.data.success) {
            setUsernameMessage(response.data.message);
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponseInterface>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username."
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    isUsernameUnique();
  }, [username]);

  const handleSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponseInterface>(
        "/api/sign-up",
        data
      );

      console.log("Sign Up response: ", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast({
        title: "Success",
        description: response.data.message,
      });

      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error("Sign Up error: ", error);
      const axiosError = error as AxiosError<ApiResponseInterface>;

      const errorMessage =
        axiosError.response?.data.message ?? "Error signing up.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ThemeToggle className="fixed top-4 right-4" />

      <div className="flex justify-center items-center min-h-svh bg-muted-background p-2 sm:py-4">
        <div className="w-full max-w-md space-y-8 p-8 bg-background rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Join Messaging App
            </h1>
            <p className="mb-4">
              Sign Up to start connecting with your friends and family.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Username Field */}
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value);
                        }}
                      />
                    </FormControl>

                    {isCheckingUsername && (
                      <Loader2
                        className="animate-spin ml-2 h-4 w-4"
                        aria-label="Loading username..."
                      />
                    )}
                    <p
                      className={`text-sm ${
                        usernameMessage === "Username is available"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {usernameMessage.length > 0 && usernameMessage}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@doe.com"
                        {...field}
                      />
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
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center mt-4">
            <p>
              Already a member?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign In
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

export default SignUp;
