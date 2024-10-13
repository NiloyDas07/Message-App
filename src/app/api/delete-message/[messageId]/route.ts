import { auth } from "@/auth";
import { User } from "next-auth";

import dbConnect from "@/lib/dbConnect";

import UserModel from "@/models/User.model";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  const { messageId } = params;

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

  try {
    const updateResponse = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    // If message not found.
    if (updateResponse.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting message: ", error);
    return Response.json(
      {
        success: false,
        message: "Something went wrong while deleting the message.",
      },
      {
        status: 500,
      }
    );
  }
}
