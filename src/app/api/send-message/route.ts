import dbConnect from "@/lib/dbConnect";

import UserModel, { Message } from "@/model/user"

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, content } = await req.json();
        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            },
                { status: 404 }
            )
        }
        // is user accepting messages???
        if (!user.isAcceptingMessages) {
            return Response.json({
                success: false,
                message: "User not Accepting Messages"
            },
                { status: 403 }
            )
        }

        const newMessages = { content, createdAt: new Date() };
        user.messages.push(newMessages as Message);
        await user.save();

        return Response.json({
            success: true,
            message: "Messages send successfully"
        },
            { status: 200 }
        )

    } catch (err) {
        console.error('Error adding messages',err)
        return Response.json({
            success: false,
            message: "Internal server error"
        },
            { status: 500 }
        )
    }
}