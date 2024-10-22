"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Reply, Trash2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponseInterface } from "@/types/apiResponse";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useRouter } from "next/navigation";

type MessageCardProps = {
  message: {
    _id: string;
    content: string;
    sender: string;
    createdAt: Date;
  };
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();

  const router = useRouter();

  // Function to delete the message.
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponseInterface>(
        `/api/delete-message/${message._id}`
      );

      toast({
        title: response?.data?.message,
      });

      onMessageDelete(message._id as string);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponseInterface>;

      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to delete message.",
      });
    }
  };

  // Function to handle reply button click.
  const handleReply = () => {
    // Get profile URL.
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/user/${message.sender}`;

    // Redirect to profile page.
    router.push(profileUrl);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center">
          {/* Sender */}
          <CardTitle>{message.sender}</CardTitle>

          <div className="flex flex-wrap gap-2">
            {/* Reply Button */}
            <Button size="sm" onClick={handleReply}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Reply className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reply</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>

            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Trash2 className="w-5 h-5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this message.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      {/* Message Content */}
      <CardContent className="text-sm">
        <p>{message.content}</p>
      </CardContent>

      {/* Time Stamp */}
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          {new Date(message.createdAt).toLocaleString()}
        </p>
      </CardFooter>
    </Card>
  );
};

export default MessageCard;
