"use client";

import { useParams, useRouter } from "next/navigation";

import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApiResponseInterface } from "@/types/apiResponse";
import { verifySchema } from "@/schemas/verify.schema";

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

const VerifyAccount = () => {
  const router = useRouter();
  const param = useParams<{ username: string }>();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const handleSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post("/api/verify-code", {
        username: param.username,
        verifyCode: data.verifyCode,
      });

      toast({
        title: "Success",
        description: response.data?.message,
      });

      router.replace("/sign-in");
    } catch (error) {
      console.log("Error verifying account: ", error);
      const axiosError = error as AxiosError<ApiResponseInterface>;
      let errorMessage =
        axiosError.response?.data.message ?? "Error verifying account.";

      toast({
        variant: "destructive",
        title: "Sign Up failed.",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-svh bg-gray-100 py-4">
      <div className="w-full max-w-[29rem] space-y-8 p-8 bg-white rounded-lg shadow-md">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Account Verification
          </h1>
          <p className="mb-4 text-gray-700">
            Please submit the <b>verification code</b> sent to your email to
            verify your account.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              name="verifyCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the verification code here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyAccount;
