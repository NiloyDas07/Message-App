import mongoose, { Schema, Document } from "mongoose";

import { IMessage, messageSchema } from "./Message.model";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifiCodeExpiryDate: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  message: IMessage[];
}

export const userSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verification code is required"],
  },
  verifiCodeExpiryDate: {
    type: Date,
    required: [true, "Verification code expiry date is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
    required: true,
  },
  message: [messageSchema],
});

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);

export default User;
