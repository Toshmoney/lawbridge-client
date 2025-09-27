"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import io, { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useRouter as Router } from "next/navigation";
import { set } from "zod";

type Message = {
  _id: string;
  sender: { _id: string; name: string; email: string };
  receiver: { _id: string; name: string; email: string };
  message: string;
  createdAt: string;
};

export default function ChatPage() {
  const router = Router();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isReceiverOnline, setIsReceiverOnline] = useState(false);
  const [receiverName, setReceiverName] = useState("User");
  const [isTyping, setIsTyping] = useState(false);
  const [receiver, setReceiver] = useState<{ _id: string; name: string; email: string, role:string } | null>(null);

  const { id: receiverId } = useParams();
  const bottomRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io("https://lawbridge-a0gx.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.emit("join", user._id);

    // receive new messages
    socket.on("receiveMessage", (msg: Message) => {
      if (
        (msg.sender._id === receiverId && msg.receiver._id === user._id) ||
        (msg.sender._id === user._id && msg.receiver._id === receiverId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // presence
    socket.on("userOnline", (onlineId: string) => {
      if (onlineId === receiverId) setIsReceiverOnline(true);
    });

    socket.on("userOffline", (offlineId: string) => {
      if (offlineId === receiverId) setIsReceiverOnline(false);
    });

    // typing indicators
    socket.on("userTyping", ({ senderId }) => {
      if (senderId === receiverId) setIsTyping(true);
    });

    socket.on("userStopTyping", ({ senderId }) => {
      if (senderId === receiverId) setIsTyping(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, receiverId]);

  // fetch chat history
  useEffect(() => {
    if (!token) return;
    const fetchChats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, [receiverId, token]);

  // fetch receiver info
  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setReceiverName(data.user.name || "User");
          setReceiver(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, [receiverId, token]);

  // auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!socketRef.current || !user?._id) return;

    socketRef.current.emit("typing", { senderId: user._id, receiverId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", { senderId: user._id, receiverId });
    }, 2000);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !user?._id) return;
    if (!socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      message: newMessage,
    });

    // stop typing
    socketRef.current.emit("stopTyping", { senderId: user._id, receiverId });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/chats")}
          className="mr-2 cursor-pointer"
        >
          ← Back
        </Button>

        <h2 className="font-semibold">{receiverName}</h2>
        <div
          className={`w-3 h-3 rounded-full ${
            isReceiverOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        ></div>
        <span className="text-sm">
          {isReceiverOnline ? "Online" : "Offline"}
        </span>

        {/* Check if user is a lawyer */}
        {receiver?.role === "lawyer" && (
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.replace(`/dashboard/lawyers/${receiver.lawyerId}`)
              }
            >
              Book Consultation
            </Button>
          </div>
        )}
      </div>


      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-2 rounded max-w-xs ${
                msg.sender._id === user?._id
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-200"
              }`}
            >
              {msg.message}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No messages yet.</div>
        )}
        {isTyping && (
          <div className="text-sm text-gray-500 italic">{receiverName} is typing...</div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 border-t">
        <Input
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
