import { auth } from "@/auth";

import { User } from "next-auth";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

// Update user message acceptance status.
export const POST = async (req: Request): Promise<Response> => {
  // Connect to db.
  await dbConnect();

  const session = await auth();
  // If user is not authenticated.
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const user: User = session.user;
  const userId = user?._id;

  const { isAcceptingMessages } = await req.json();

  try {
    // Update user status.
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { isAcceptingMessages },
      { new: true }
    );

    // If user not found or update failed.
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update status of user accepting messages.",
        },
        {
          status: 401,
        }
      );
    }

    // Return success response.
    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully.",
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Failed to update status of user accepting messages: ",
      error
    );
    return Response.json(
      {
        success: false,
        message: "Failed to update status of user accepting messages.",
      },
      {
        status: 500,
      }
    );
  }
};

// Check user message acceptance status.
export const GET = async (req: Request): Promise<Response> => {
  // Connect to db.
  await dbConnect();

  const session = await auth();

  // If user is not authenticated.
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const user: User = session?.user;
  const userId = user?._id;

  try {
    // Find user by id.
    const user = await UserModel.findOne({ _id: userId });

    // If user not found.
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Error while getting user message acceptance status.",
        },
        {
          status: 404,
        }
      );
    }

    // Return success response.
    return Response.json(
      {
        success: true,
        message: "User message acceptance status found successfully.",
        isAcceptingMessages: user.isAcceptingMessages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to find user message acceptance status: ", error);
    return Response.json(
      {
        success: false,
        message: "Failed to find user message acceptance status.",
      },
      {
        status: 500,
      }
    );
  }
};
