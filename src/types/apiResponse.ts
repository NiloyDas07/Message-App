import { MessageInterface } from "@/models/Message.model";

export interface ApiResponseInterface {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<MessageInterface>;
}
