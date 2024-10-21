import mongoose, { Schema, Document } from "mongoose";

export interface MessageInterface extends Document {
  senderId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export const messageSchema: Schema<MessageInterface> = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Message =
  mongoose.models?.Message ||
  mongoose.model<MessageInterface>("Message", messageSchema);

export default Message;
