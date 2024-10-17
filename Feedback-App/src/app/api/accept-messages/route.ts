import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/model/user";


export async function POST(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User

    if (!session || !user) {

        return Response.json({
            success: false,
            message: "Not Authenticated"
        },
            { status: 401 }
        )
    }
    const userId = user._id
    const { acceptMessages } = await req.json()

    try {

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        )

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Failed to update user status to accept Messages"
            },
                { status: 401 }
            )
        }

        return Response.json({
            success: true,
            message: "Message acceptance status updated successfully", updatedUser
        },
            { status: 200 }
        )


    } catch (err) {
        
        console.error("Error updating acceptance status:", err); // Log the error

        return Response.json({
            success: false,
            message: "Failed to update user status to accept Messages"
        },
            { status: 500 }
        )
    }
}

export async function GET() {
    await dbConnect();
 
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User

    if (!session || !user) {

        return Response.json({
            success: false,
            message: "Not Authenticated"
        },
            { status: 401 }
        )
    }
    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            },
                { status: 404 }
            )
        }

        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessages
        },
            { status: 200 }
        )

    } catch (err) {

        console.error("Error is getting messages acceptance status",err)
        return Response.json({
            success: false,
            message: "Error is getting messages acceptance status",
        },
            { status: 500 }
        )
    }


}