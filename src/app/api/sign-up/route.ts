import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

import User from "@/models/User.model";
import { ApiResponseInterface } from "@/types/apiResponse";

export const POST = async (req: Request): Promise<Response> => {
  // Connect to db.
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    // Check if user already exists.
    const existingUserVerifiedByUsername = await User.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await User.findOne({ email });

    // Generate verification code.
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate expiry date for verification code.
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // If user doesn't exist, create new user account.
    if (!existingUserByEmail) {
      // Hash the password.
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user.
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiryDate: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        message: [],
      });

      // Save user to db.
      await newUser.save();
    } else {
      // If verified user already exists with this email.
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User with this email already exists.",
          },
          {
            status: 400,
          }
        );
      }
      // If user already exists with this email but is not verified.
      else {
        // Hash the password.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user with new details.
        existingUserByEmail.username = username;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiryDate = expiryDate;
        existingUserByEmail.password = hashedPassword;

        // Save user to db.
        await existingUserByEmail.save();
      }
    }

    console.log("User: ", existingUserByEmail);

    // Send verification email.
    const verificationEmailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    console.log(
      "Full Resend response:",
      JSON.stringify(verificationEmailResponse, null, 2)
    );

    if (!verificationEmailResponse.success) {
      return Response.json(
        {
          success: false,
          message: verificationEmailResponse.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error registering user: ", error);

    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
};
