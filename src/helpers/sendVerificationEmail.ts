import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verifivationEmail";
import { ApiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
) :Promise<ApiResponse> {
    
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'True Feedback | Verification code',
            react: VerificationEmail({username,otp:verifyCode}),
          });

        return {success:true,message:'Verification email send successfully'}
        
    } catch (err) {
        console.error("Error sending verification email",err)
        return {success:false,message:'Failed to send verification email'}
    }
}

