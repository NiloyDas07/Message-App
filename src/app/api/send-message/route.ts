import { auth } from "@/auth";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import MessageModel from "@/models/Message.model";
import mongoose from "mongoose";

export const POST = async (req: Request): Promise<Response> => {
  // Connect to db.
  await dbConnect();

  const session = await auth();

  // If user is not authenticated.
  if (!session || !session.user || !session.user._id) {
    return Response.json(
      {
        success: false,
        message: "Please Sign In to send message.",
      },
      {
        status: 401,
      }
    );
  }

  // Sender Id is the current user.
  const senderId = new mongoose.Types.ObjectId(session.user._id);

  const { username, content } = await req.json();

  try {
    // Find the reciever.
    const reciever = await UserModel.findOne({ username }).select(
      "_id isAcceptingMessages"
    );

    // If reciever not found.
    if (!reciever) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // If user is not accepting messages.
    if (!reciever.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages.",
        },
        { status: 403 }
      );
    }

    console.log("reciever: ", reciever);

    // Create new message.
    const newMessage = { senderId, receiverId: reciever._id, content };

    console.log("newMessage: ", newMessage);

    // Save message.
    const response = await MessageModel.create(newMessage);

    console.log("Message sent:", response);

    // Return success response.
    return Response.json(
      {
        success: true,
        message: "Message sent successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json(
      {
        success: false,
        message: "Error sending message.",
      },
      { status: 500 }
    );
  }
};
