import mongoose, { Schema, Document,Types } from "mongoose";


export interface Message extends Document {
    _id: string; 
    content: string,
    createdAt: Date
}

// export type MessageWithNestedContent = {
//     messages: Message; // Change this if messages is an array or has different structure
// };

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

export interface User extends Document {
    _id: Types.ObjectId;  // Ensure _id is of type ObjectId
    username: string,
    email: string,
    password: string,
    verifyCode: string,
    verifyCodeExpiry: Date,
    isVerified: boolean,
    isAcceptingMessages: boolean,
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        require: [true, "Username is required"],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        require: [true, "Username is required"],
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, " Please use a valid Email"]
    },
    password: {
        type: String,
        require: [true, "Password is required"],
        unique: true,
    },
    verifyCode: {
        type: String,
        require: [true, "Verify Code is required"],
    },    
    verifyCodeExpiry: {
        type: Date,
        require: [true, "Verify Code Expiry is required"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
    },
    messages: [MessageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User",UserSchema)

export default UserModel;