import { auth } from "@/auth";
import { User } from "next-auth";

import dbConnect from "@/lib/dbConnect";

import MessageModel from "@/models/Message.model";

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

  console.log("messageId: ", messageId, "userId: ", user._id);

  try {
    const deleteResponse = await MessageModel.findOneAndDelete({
      _id: messageId,
      receiverId: user._id,
    });

    console.log("deleteResponse: ", deleteResponse);

    // If message not found.
    if (!deleteResponse) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted.",
        },
        { status: 404 }
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
