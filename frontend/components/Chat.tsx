"use client";

import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import api from "@/lib/api";

type Message = {
    _id: string;
    text: string;
    user: {
        _id: string;
        name: string;
    };
    createdAt: string;
};

export default function Chat({ teamId }: { teamId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [notification, setNotification] = useState("");
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const useStr = localStorage.getItem("user");
        if (useStr) setCurrentUser(JSON.parse(useStr));
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/message/${teamId}`);

                if (Array.isArray(res.data)) setMessages(res.data);
                else setMessages([]);

                scrollToBottom();
            }
            catch (err: any) {
                console.error("Failed to fetch messages", err.response?.data);
            }
        };
        if (teamId) fetchMessages();
    }, [teamId]);

    const showNotification = (text: string) => {
        setNotification(text);
        setTimeout(() => setNotification(""), 3000);
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }, 100);
    };

    useEffect(() => {
        socketRef.current = io("http://localhost:5000", {
            withCredentials: true,
        });

        const socket = socketRef.current;

        socket.on("connect",()=>{
            console.log("Connected to Socket! Joining room: ",teamId);
            socket.emit("JoinTeamRoom", teamId);
        })

        socket.on("receiveMessage", (message: Message) => {
            console.log("Got new message from backend! ",message);
            setMessages((prev) => [...prev, message]);
            scrollToBottom();

            const isMine = currentUser && message.user._id === currentUser.id;
            if (!isMine) {
                showNotification(`New message from ${message.user.name}`);
            }
        });

        socket.on("messageDeleted", (deletedMessageId: string) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== deletedMessageId));
        });

        return () => {
            socket.disconnect();
        };
    }, [teamId, currentUser]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit("sendMessage", {
            teamId,
            message: newMessage,
        });

        setNewMessage("");
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            await api.delete(`/message/${messageId}`);

            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));

            socketRef.current?.emit("deleteMessage", {
                teamId,
                messageId,
            });
        }
        catch (err) {
            alert("Failed to delete message");
        }
    };

    return (
        <div className="flex flex-col h-[600px] border border-gray-300 bg-white shadow-sm relative">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>

                    <h3 className="font-bold text-lg text-black">
                        Team Chat
                    </h3>
                </div>
            </div>

            {/* Temporary Floating Notification */}
            {notification && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg z-10 transition-opacity">
                    {notification}
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-gray-50/30 group">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        No messages yet. Say hello!
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMine = currentUser && msg.user._id === currentUser.id;

                    return (
                        <div key={msg._id || idx} className={`flex flex-col max-w-[80%] ${isMine ? "self-end" : "self-start"}`}>

                            {/* Name Label */}
                            <div className={`flex items-baseline gap-2 mb-1 ${isMine ? "justify-end" : "justify-start"}`}>

                                <span className={`text-xs font-bold ${isMine ? "text-gray-500" : "text-blue-600"}`}>
                                    {isMine ? "You" : msg.user.name || "Unknown"}
                                </span>

                                {/* Delete Button */}
                                {isMine && msg._id && (
                                    <button onClick={() => handleDeleteMessage(msg._id)} className="text-[10px] text-red-400 hover:text-red-700 font-bold uppercase">
                                        Delete
                                    </button>
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`px-4 py-3 text-sm shadow-sm ${isMine ? "bg-black text-white rounded-l-xl rounded-tr-xl" : "bg-white border border-gray-200 text-black rounded-r-xl rounded-t1-xl"}`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-300 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">

                    <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" />

                    <button type="submit" disabled={!newMessage.trim()} className="px-6 py-3 bg-black text-white font-bold uppercase text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}