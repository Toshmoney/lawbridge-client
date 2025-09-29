"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";

import Link from "next/link";

type Conversation = {
  user: { _id: string; name: string; email: string };
  lastMessage: string;
  lastDate: string;
};

let socket: Socket | null = null;

export default function ChatListPage() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      console.log("token",token);
      
      // alert(`user: ${user}, token: ${token}`);
      alert("Session expired. Please log in again.");
      window.location.href = "/login";
      return;
    };

    // fetch conversations
    const fetchConversations = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log(data);
      
      setConversations(data);
    };
    fetchConversations();

    // connect socket
    socket = io(process.env.NEXT_PUBLIC_API_URL!, { transports: ["websocket"] });
    socket.emit("join", user?._id);

    socket.on("userOnline", (id: string) =>
      setOnlineUsers((prev) => [...prev, id])
    );
    socket.on("userOffline", (id: string) =>
      setOnlineUsers((prev) => prev.filter((uid) => uid !== id))
    );

    return () => {
      socket?.disconnect();
    };
  }, [user, token]);

  const isOnline = (id: string) => onlineUsers.includes(id);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Chats</h1>
      <div className="divide-y border rounded-lg bg-white">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <Link
              key={conv.user._id}
              href={`/dashboard/chats/${conv.user._id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold flex items-center gap-2">
                  {conv.user.name}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline(conv.user._id)
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                </p>
                <p className="text-sm text-gray-500 truncate w-48">
                  {conv.lastMessage}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(conv.lastDate).toLocaleDateString()}
              </span>
            </Link>
          ))
        ) : (
          <p className="p-4 text-gray-500">No conversations yet.</p>
        )}
      </div>
    </div>
  );
}
