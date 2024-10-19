import { auth } from "@/auth";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

export const POST = async (req: Request): Promise<Response> => {
  // Connect to db.
  await dbConnect();

  const session = await auth();

  // If user is not authenticated.
  if (!session || !session.user) {
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

  const { username, content } = await req.json();

  try {
    // Find the user.
    const user = await UserModel.findOne({ username });

    // If user not found.
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // If user is not accepting messages.
    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages.",
        },
        { status: 403 }
      );
    }

    // Create new message.
    const newMessage = { content };

    // Save message.
    user.messages.push(newMessage);
    await user.save();

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
