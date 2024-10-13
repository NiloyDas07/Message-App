"use client";

import { useCallback, useEffect, useState } from "react";

import { MessageInterface } from "@/models/Message.model";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { acceptMessageSchema } from "@/schemas/acceptMessage.schema";
import axios, { AxiosError } from "axios";
import { set } from "mongoose";
import { ApiResponseInterface } from "@/types/apiResponse";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";

const page = () => {
  const [messages, setMessages] = useState<MessageInterface[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  // Function to delete message from the state.
  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  // Form for accepting messages.
  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const isAccepting = watch("isAccepting");

  // Function to fetch message acceptance settings.
  const fetchIsAcceptingMessages = useCallback(async () => {
    setIsSwitchLoading(true);

    try {
      const response = await axios.get<ApiResponseInterface>(
        "/api/accept-messages"
      );

      setValue("isAccepting", response.data?.isAcceptingMessages || false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponseInterface>;

      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "Failed to fetch message settings.",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, setIsSwitchLoading, toast]);

  // Function to fetch all messages.
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);

      try {
        const response = await axios.get<ApiResponseInterface>(
          "/api/get-messages"
        );

        setMessages(response.data?.messages || []);

        if (refresh) {
          toast({
            variant: "success",
            title: "Refreshed Messages",
            description: "Already showing latest messages.",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponseInterface>;

        toast({
          variant: "destructive",
          title: "Error",
          description:
            axiosError.response?.data.message || "Failed to fetch messages.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setIsSwitchLoading, toast, setMessages]
  );

  // Fetch messages and settings on page load.
  useEffect(() => {
    // If user is not logged in.
    if (!session || !session.user) return;

    fetchMessages();
    fetchIsAcceptingMessages();
  }, [session, setValue, fetchMessages, fetchIsAcceptingMessages]);

  // Function to handle isAccepting switch change.
  const handleAcceptMessageChange = async () => {
    setIsSwitchLoading(true);

    try {
      const response = await axios.post<ApiResponseInterface>(
        "/api/accept-messages",
        {
          isAcceptingMessages: !isAccepting,
        }
      );

      setValue("isAccepting", !isAccepting);

      toast({
        title: response.data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponseInterface>;

      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to fetch messages.",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };

  // If user is not logged in.
  if (!session || !session.user) {
    return <div>Please sign in to view this page.</div>;
  }

  // Get profile URL.
  const { username } = session?.user || {};
  const baseUrl = `${window.location.protocol}//${window.location.host}`;

  const profileUrl = `${baseUrl}/user/${username}`;

  // Function to copy profile URL to clipboard.
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(profileUrl);

    toast({
      title: "Copied to clipboard.",
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      {/* Heading */}
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>

      {/* Copy to clipboard */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          Copy profile URL to clipboard
        </h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      {/* Accept messages switch*/}
      <div className="mb-4">
        <Switch
          {...register("isAccepting")}
          checked={isAccepting}
          onCheckedChange={handleAcceptMessageChange}
          disabled={isSwitchLoading}
        />

        <span className="ml-2">
          Accept Messages: {isAccepting ? "Yes" : "No"}
        </span>
      </div>

      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={(message._id as string) || index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <div>No messages found.</div>
        )}
      </div>
    </div>
  );
};

export default page;
