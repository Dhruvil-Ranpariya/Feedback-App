import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel, { User as MongooseUser } from "@/model/user";

interface CustomNextAuthUser extends NextAuthUser {
  _id: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  username: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(
        credentials: Record<"identifier" | "password", string> | undefined
      ): Promise<CustomNextAuthUser | null> {

        if (!credentials) {
          throw new Error("No credentials provided");
        }

        const identifier = credentials.identifier;
        const password = credentials.password;

        // console.log("Identifier:", identifier); // Log identifier to see its value
        // console.log("Password:", password); // Log password to see its value

        await dbConnect();
        try {
          //   console.log("Authorize received credentials:", credentials);

          const user = (await UserModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
          })) as MongooseUser | null;

          //   console.log("User found---:", user);

          if (!user) {
            throw new Error("User not found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );

          if (isPasswordCorrect) {
            const nextAuthUser: CustomNextAuthUser = {
              _id: user._id.toString(),
              id: user._id.toString(),
              isVerified: user.isVerified,
              isAcceptingMessages: user.isAcceptingMessages,
              username: user.username,
              email: user.email,
            };

            return nextAuthUser;
          } else {
            throw new Error("Incorrect Password");
          }
        } catch (err: unknown) {
          throw new Error(
            (err as Error).message || "An error occurred during authorization"
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = (user as CustomNextAuthUser)._id;
        token.isVerified = (user as CustomNextAuthUser).isVerified;
        token.isacceptingMessages = (
          user as CustomNextAuthUser
        ).isAcceptingMessages;
        token.username = (user as CustomNextAuthUser).username;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 2 * 60, // Set session max age to 2 minutes (120 seconds)
  },
  jwt: {
    maxAge: 2 * 60, // Set jwt max age to 2 minutes (120 seconds)
  },

  pages: {
    signIn: "/sign-in",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
