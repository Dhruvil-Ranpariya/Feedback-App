import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/model/user";
import mongoose from "mongoose";


export async function GET() {
    await dbConnect()

    const session = await getServerSession(authOptions);
    // console.log("Session data:", session); // Log the session

    const user: User = session?.user as User

    if (!session || !user) {

        return Response.json({
            success: false,
            message: "Not Authenticated"
        },
            { status: 401 }
        )
    }
    const userId = new mongoose.Types.ObjectId(user._id)
// console.log('userid ==',userId);

    try {

        // const user = await UserModel.aggregate([
        //     { $match: { _id: userId } },
        //     { $unwind: '$messages' },
        //     { $project: {_id:0 , messages: 1 } },
        //     { $sort: { 'messages.createdAt': -1 } }
        //     // { $group: { _id: '$_id'} }
        // ])
        
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
          ]).exec();

        // {$unwind:'$messages'},{$project: {_id:0,message:'$messages.content',CreatedAt:'messages.createdAt'}}

        // console.log("User found:", user);


        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "User not found"
            },
                { status: 401 }
            )
        }
        // console.log("Messages----:", user);

        return Response.json({
            success: true,
            messages: user[0].messages
        },
            { status: 200 }
        )

    } catch (err) {
        console.error(' An unexpected Error occured', err)
        return Response.json({
            success: false,
            message: "Internal server error"
        },
            { status: 500 }
        )
    }

}