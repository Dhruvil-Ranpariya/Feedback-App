import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { username, code } = await req.json()

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername })

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not Found "
                },
                { status: 500 }
            )
        }

        const isValid  = user.verifyCode==code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry)>new Date()

        if(isValid && isCodeNotExpired){
            user.isVerified = true;
            user.save();

            return Response.json(
                {
                    success: true,
                    message: "Account verify seccessfull"
                },
                { status: 200 }
            )
        }else if(!isCodeNotExpired){
            return Response.json(
                {
                    success: false,
                    message: "Verification code is expired, Please signup again to get a new code "
                },
                { status: 400 }
            )
        }else{
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification code"
                },
                { status: 400 }
            )
        }

    } catch (err) {
        console.error("Error verifing user", err)
        return Response.json(
            {
                success: false,
                message: "Error verifing user"
            },
            { status: 500 }
        )
    }

}