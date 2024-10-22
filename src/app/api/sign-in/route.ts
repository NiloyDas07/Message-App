import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";

export const POST = async (req: Request): Promise<Response> => {
  // Connect to db.
  await dbConnect();

  const { identifier, password } = await req.json();

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    // If user not found.
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Invalid credentials.",
        },
        {
          status: 401,
        }
      );
    }

    // If user is not verified.
    if (!user.isVerified) {
      return Response.json(
        {
          success: false,
          message: "Please verify your email to login.",
        },
        {
          status: 401,
        }
      );
    }

    // Match password.
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // If password doesn't match.
    if (!isPasswordMatch) {
      return Response.json(
        {
          success: false,
          message: "Invalid credentials.",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        user: {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          isAcceptingMessages: user.isAcceptingMessages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Something went wrong while signing in. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
};
