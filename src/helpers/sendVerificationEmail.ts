import { resend } from "@/lib/resend";

import VerificatonEmail from "../../emails/VerificationEmail";

import { ApiResponseInterface } from "@/types/apiResponse";

export const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponseInterface> => {
  try {
    // const { data, error } = await resend.emails
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Messages | Verification Email",
      react: VerificatonEmail({ username, otp: verifyCode }),
    });

    return { success: true, message: "Verification email sent" };
  } catch (emailError) {
    console.error("Error sending verification email", emailError);

    return { success: false, message: "Error sending verification email" };
  }
};
