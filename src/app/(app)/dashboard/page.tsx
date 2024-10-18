"use client";

import MessageCard from "@/components/messageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/user";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";



function Page() {
  const [message, setMessage] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState<string>("");

  console.log(message);

  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteMessage = (messageId: string) => {
    setMessage(message.filter((message) => message._id !== messageId));
  };

  const { data: session ,status} = useSession();

  useEffect(() => {
  
    if (status === "loading") return;
    const notUserInSession = !session?.user;
    if (notUserInSession) {
      router.replace("/"); 
    }
  }, [router, session, status]);
  

  // console.log("sessionnnnn----", session?.user);

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/accept-messages`);
      setValue("acceptMessages", response.data.isAcceptingMessages);
    } catch (err) {
      console.error("Failed to fetch message setting", err);
      const axiosError = err as AxiosError<ApiResponse>;
    
      toast({
        title: "Failed to fetch message setting",
        description: axiosError.response?.data.message || "Error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue,toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);

      try {
        const response = await axios.get<ApiResponse>(`/api/get-messages`);
        // console.log("Fetched messages:", response.data.messages);

        const fetchedMessages = response.data.messages || [];
        // console.log("Fetched messages:", fetchedMessages); 
  
        setMessage(fetchedMessages); 
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing letest Messages",
          });
        }

      } catch (err) {
        console.error("Failed to fetch message setting", err);
        const axiosError = err as AxiosError<ApiResponse>;
        const errorMessage =
          axiosError.response?.data.message ||
          "Failed to fetch message setting";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessage, toast]
  );

  useEffect(() => {
    if (session && session.user) {
      fetchMessages();
      fetchAcceptMessage();
    }
  }, [session, setValue, toast, fetchAcceptMessage, fetchMessages]);

  //handle swith change
  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);

    try {
      const newAcceptStatus = !acceptMessages;
      const response = await axios.post<ApiResponse>(`/api/accept-messages`, {
        acceptMessages: newAcceptStatus,
      });

      setValue("acceptMessages", newAcceptStatus);
      // console.log("Switch changed to:", newAcceptStatus);
      // console.log("Switch response:", response.data.message);

      toast({
        title: response.data.message,
        description: "Status Updated ",
        variant: "default",
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;

      toast({
        title: "Error changing acceptance status",
        description:
          axiosError.response?.data.message ||
          "Failed to fetch message setting",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };


  const username = session?.user ? (session.user as User).username : "";

  //TODO: do more research
  useEffect(() => {
    if (typeof window !== "undefined" && session && session.user) {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${username}`);
    }
  }, [username, session]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(profileUrl)
      .then(() => {
        toast({
          title: "URL copied", // success toast for copying URL
          description: "Profile URL has been copied to clipboard",
        });
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        toast({
          title: "Copy failed", // Error toast for copy failure
          description: "Failed to copy the URL.",
          variant: "destructive",
        });
      });
  };
  
  
  return (
    
    <div
    className="min-h-screen w-full bg-gray-200 flex flex-col items-center justify-center"
  >
    <div className="min-h-screen  my-7 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-[96%]">
      <div className="flex-grow">
        <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
  
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
          <div className="flex items-center">
            <input
              type="text"
              value={profileUrl}
              disabled
              className="input input-bordered w-full p-2 mr-2"
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>
  
        <div className="mb-4">
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="ml-2">
            Accept Messages: {acceptMessages ? "On" : "Off"}
          </span>
        </div>
        <Separator />
  
        <Button
          className="mt-4"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
  
        <div
          className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 ${
            message.length > 0 ? "max-h-[calc(100vh-300px)] overflow-y-auto" : ""
          }`}
        >
          {message.length > 0 ? (
            message.map((msg) => (
              <MessageCard
                key={msg.id}
                message={msg}
                onMessageDelete={(messageId: string) =>
                  handleDeleteMessage(messageId)
                }
              />
            ))
          ) : (
            <p>No messages to display.</p>
          )}
        </div>
      </div>
    </div>
  </div>
  
    
  );
}

export default Page;
