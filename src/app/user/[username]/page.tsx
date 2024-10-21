"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import axios, { AxiosError } from "axios";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { messageSchema } from "@/schemas/message.schema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCompletion } from "ai/react";

import { ApiResponseInterface } from "@/types/apiResponse";

import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Separator used to separate messages fetched by suggest-messages.
const messagesSeparator = "||";

// Function to separate the messages in the completion state.
const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(messagesSeparator);
};

// Initial message string.
const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

const SendMessage = () => {
  const { data: session } = useSession();

  const router = useRouter();

  const { toast } = useToast();

  // Get username from params.
  const params = useParams<{ username: string }>();
  const username = params.username;

  // Function to check if user exists and redirect to dashboard if not.
  const checkUserExists = async () => {
    try {
      const user = await axios.get(`/api/get-user-by-username/`, {
        params: { username },
      });

      if (!user || user.data.success === false) {
        toast({
          title: "User Not Found",
          description: "User not found. Redirecting to home.",
          variant: "destructive",
        });
        router.replace("/");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          toast({
            title: "User Not Found",
            description: "User not found. Redirecting to home.",
            variant: "destructive",
          });
          router.replace("/");
        }
      }
    }
  };

  useEffect(() => {
    checkUserExists();
  }, [username]);

  // Latest suggested messages.
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);

  type Reducer<S, A> = (state: S, action: A) => S;

  // Reducer function to update previously suggested messages and keep length <= 30.
  const previousMessagesReducer = (state: string[], action: any) => {
    switch (action.type) {
      case "add":
        const totalLength = action.payload.length + state.length;
        if (totalLength >= 30) {
          return [...state.slice(totalLength - 30), ...action.payload];
        } else {
          return [...state, ...action.payload];
        }
      default:
        return state;
    }
  };

  // The last 10 sets of suggested messages.
  const [previousMessages, dispatchPreviousMessages] = useReducer<
    Reducer<string[], any>
  >(previousMessagesReducer, initialMessageString.split(messagesSeparator));

  // Using useCompletion hook provided by ai/react to fetch the suggested messages.
  const {
    complete,
    completion,
    isLoading: isSuggestionLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialMessageString,
    body: {
      previousMessages,
    },
  });

  // Check if user exists and Load the first set of suggested messages on mount.
  useEffect(() => {
    complete("");
    const messages = parseStringMessages(completion);
    setSuggestedMessages(messages);
    dispatchPreviousMessages({ type: "add", payload: messages });
  }, []);

  // Form validation with Zod.
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  // Watch the content of the form.
  const messageContent = form.watch("content");

  // If user clicks on one of the suggested messages.
  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  // Loading state for the form submission.
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle form submission (Send message).
  const handleSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponseInterface>(
        "/api/send-message",
        { ...data, username }
      );

      toast({
        title: response.data.message,
      });

      form.reset({ ...form.getValues(), content: "" }); // Check again.
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponseInterface>;

      if (axiosError.response?.status === 401) {
        toast({
          description: "Please sign in to send messages.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            axiosError.response?.data?.message || "Failed to send message.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch suggested messages.
  const fetchSuggestedMessages = async () => {
    try {
      complete("");
      const messages = parseStringMessages(completion);
      setSuggestedMessages(messages);

      dispatchPreviousMessages({ type: "add", payload: messages });
    } catch (error) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch suggested messages.",
      });
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-background rounded max-w-4xl">
      {/* Heading */}
      <h1 className="text-4xl font-bold mb-6 text-center">
        Send a message to <span className="text-blue-500">{username}</span>
      </h1>

      {/* Form - Send Message */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Textarea for the message */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Enter the message.</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Send Button */}
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Suggested Messages */}
      <div className="space-y-4 my-8">
        <div className="space-y-2">
          {/* Suggest Messages Button */}
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestionLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>

        {/* Suggested Messages */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>

          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              suggestedMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2 text-wrap py-7 h-fit shadow"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Account Button if user is not logged in */}
      {!session && (
        <>
          <Separator className="my-6" />

          <div className="text-center">
            <div className="mb-4">Get Your Message Board</div>
            <Link href={"/sign-up"}>
              <Button>Create Your Account</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SendMessage;
