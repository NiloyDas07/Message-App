"use client";

import {
  Card,
  CardContent,
  CardDescription,
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
import { X } from "lucide-react";

import { MessageInterface } from "@/models/Message.model";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponseInterface } from "@/types/apiResponse";

type MessageCardProps = {
  message: MessageInterface;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();

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

  return (
    <Card className="">
      <CardHeader>
        <div className="flex justify-between items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <X className="w-5 h-5" />
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
        <CardContent className="text-sm">
          <p>{message.content}</p>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default MessageCard;
