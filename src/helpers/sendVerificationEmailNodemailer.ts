import nodemailer from "nodemailer";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponseInterface } from "@/types/apiResponse";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponseInterface> => {
  try {
    const { renderToStaticMarkup } = await import("react-dom/server");
    // Render the React component to an HTML string
    const emailHtml = renderToStaticMarkup(
      VerificationEmail({ username, otp: verifyCode })
    );

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Acme" <SimpleChat>',
      to: email,
      subject: "Verification Email",
      html: emailHtml,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, message: "Verification email sent" };
  } catch (emailError) {
    console.error("Error sending verification email", emailError);
    return { success: false, message: "Error sending verification email" };
  }
};
