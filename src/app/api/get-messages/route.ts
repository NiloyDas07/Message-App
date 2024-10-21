import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { User } from "next-auth";

import UserModel from "@/models/User.model";

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

  const user: User = session.user;
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    // Get all messages of the user.
    const user = await UserModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "receiverId",
          as: "messages",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderDetails",
              },
            },
            {
              $unwind: "$senderDetails",
            },
            {
              $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                sender: "$senderDetails.username",
              },
            },
          ],
        },
      },
      {
        $project: {
          messages: 1,
          _id: 0,
        },
      },
    ]);

    // If user not found.
    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Return success response.
    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting messages: ", error);
    return Response.json(
      {
        success: false,
        message: "Error getting messages.",
      },
      {
        status: 500,
      }
    );
  }
};
