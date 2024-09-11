import mongoose, { Schema, Document } from "mongoose";

export interface MessageInterface extends Document {
  content: string;
  createdAt: Date;
}

export const messageSchema: Schema<MessageInterface> = new Schema({
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
