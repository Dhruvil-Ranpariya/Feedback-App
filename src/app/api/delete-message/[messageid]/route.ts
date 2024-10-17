import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/model/user";

export async function DELETE(
  req: Request,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

if(updateResult.modifiedCount==0){
  return Response.json(
    {
      success: false,
      message: "Message not found or already deleted",
    },
    { status: 404 }
  );
}

return Response.json(
  {
    success: true,
    message: "Message Deleted",
  },
  { status: 200 }
);

  } catch (err) {
    console.error("Error in deleting message route",err)
    return Response.json(
      {
        success: false,
        message: "Error in deleting message",
      },
      { status: 500 }
    );
  }
}
