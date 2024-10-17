import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    await dbConnect();

    try {

        const { username, email, password } = await req.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {

            return Response.json({
                success: false,
                message: "Username is already taken",
            }, { status: 400 })
        }

        const existingUserByEmail = await UserModel.findOne({ email })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: true,
                    message: "User Already exist with this email"
                }, { status: 400 })
            } else {

                const hashPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now()+3600000)

                await existingUserByEmail.save()
            }
        } else {
            const hashPassword = await bcrypt.hash(password, 10)

            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })

            await newUser.save()
        }
        //send verification code 

        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
// console.log('this is email response',emailResponse);

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 })
        }

        return Response.json({
            success: true,
            message: "User registered successfully, Please verify your Email"
        }, { status: 201 })

    } catch (err) {
        console.error("Error in Registering user", err)
        return NextResponse.json({
            success: false,
            message: "Error in Registering user"
        }, {
            status: 500
        })
    }


}