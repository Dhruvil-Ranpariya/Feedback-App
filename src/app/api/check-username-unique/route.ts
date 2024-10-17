import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import z from "zod"
import { usernameValidation } from "@/schemas/signUpSchema";


const usernameQuerySchema = z.object({
    username: usernameValidation
})


export async function GET(req: Request) {

    await dbConnect();
    // localhost:3000/api/cuu?username=dhruv?phone=samsung
    try {
        const { searchParams } = new URL(req.url);
        const queryParams = {
            username: searchParams.get("username")
        }
        //validate with zod

        const result = usernameQuerySchema.safeParse(queryParams)
        // console.log('this is result', result);  //TODO : remove

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []

            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "invalid query perameters"
            }, { status: 400 })
        }
        const { username } = result.data

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingVerifiedUser) { 
            return Response.json({
                success: false,
                message: "Username is already teken"
            },
                { status: 200 }
            )
        }

        return Response.json({
            success: true,
            message: "Username is unique"
        },
            { status: 200 }
        )

    } catch (err) {
        console.error("Error in checking Username", err)
        return Response.json({
            success: false,
            message: "Error in checking Username"
        },
            { status: 500 }
        )
    }


}