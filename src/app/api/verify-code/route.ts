import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";

export const POST = async (req: Request): Promise<Response> => {
  // Connect to db.
  await dbConnect();

  try {
    const { username, verifyCode } = await req.json();

    console.log("username: ", username);
    console.log("verifyCode: ", verifyCode);

    // Find user by username.
    const user = await User.findOne({ username });

    // If user not found.
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Check if verification code is correct.
    const isCodeValid = user.verifyCode === verifyCode;

    // Check if verification code is expired.
    const isCodeExpired = new Date() >= new Date(user.verifyCodeExpiryDate);

    // If verification code is valid and not expired.
    if (isCodeValid && !isCodeExpired) {
      // Set user as verified.
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified",
        },
        {
          status: 200,
        }
      );
    } else {
      // If verification code has expired.
      if (isCodeExpired) {
        return Response.json(
          {
            success: false,
            message:
              "Verification code expired, Please sign up again to get a new code.",
          },
          {
            status: 400,
          }
        );
      }

      // If verification code is not valid.
      return Response.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error verifying code", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying code",
      },
      {
        status: 500,
      }
    );
  }
};
