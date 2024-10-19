import nodemailer from "nodemailer";
import { generateVerificationEmail } from "../../emails/verifivationEmail"; 
import { ApiResponse } from "@/types/apiResponse";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587,
  secure: false,
  auth: {
    user: "truefeedback.in@gmail.com",
    pass: "uver rpuy pwnu ajyi",
  },
});

// Function to send verification email using Nodemailer
export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const host = window.location.host
    const protocol = window.location.protocol;

    // Generate the email content as an HTML string
    const emailContent = generateVerificationEmail(username, verifyCode,host,protocol);

    // Send the email using Nodemailer
    await transporter.sendMail({
      from: '"True Feedback" <no-reply@truefeedback.com>',
      to: email,
      subject: 'True Feedback | Verification code',
      html: emailContent, 
    });

    return { success: true, message: "Verification email sent successfully" };
  } catch (err) {
    console.error("Error sending verification email", err);
    return { success: false, message: "Failed to send verification email" };
  }
}
