import { useParams } from "next/navigation";
import { useCompletion } from "ai/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { messageSchema } from "@/schemas/message.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponseInterface } from "@/types/apiResponse";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";

const messagesSeparator = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(messagesSeparator);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

const SendMessage = () => {
  const { toast } = useToast();
  const params = useParams<{ username: string }>();
  const username = params.username;

  const {
    complete,
    completion,
    isLoading: isSuggestionLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialMessageString,
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

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

      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data?.message || "Failed to send message.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      complete("");
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
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      {/* Heading */}
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      {/* Form - Send Message */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        ></form>
      </Form>
    </div>
  );
};

export default SendMessage;
