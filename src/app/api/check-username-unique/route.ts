import { z } from "zod";

import dbConnect from "@/lib/dbConnect";

import User from "@/models/User.model";
import { usernameValidation } from "@/schemas/signUp.schema";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export const GET = async (req: Request): Promise<Response> => {
  // Connect to db.
  await dbConnect();

  try {
    // Get username from query params.
    const { searchParams } = new URL(req.url);
    const queryParam = { username: searchParams.get("username") };

    // Validate with zod.
    const usernameQuery = usernameQuerySchema.safeParse(queryParam);

    console.log("usernameQuery: ", usernameQuery);

    // Error checking with zod.
    if (!usernameQuery.success) {
      const usernameErrors =
        usernameQuery.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Error checking if username is unique.",
        },
        {
          status: 400,
        }
      );
    }

    const { username } = usernameQuery.data;

    // Check if username is unique.
    const existingVerifiedUser = await User.findOne({
      username,
      isVerified: true,
    });

    // If username is not unique.
    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    // If username is unique.
    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking if username is unique", error);
    return Response.json(
      {
        success: false,
        message: "Error checking if username is unique",
      },
      {
        status: 500,
      }
    );
  }
};
