"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/components/ui/Button";

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      participantId: "user2",
      participantName: "ProPlayer",
      participantAvatar: "https://via.placeholder.com/40",
      lastMessage: "Vamos fazer uma partida?",
      lastMessageTime: new Date().toISOString(),
      unread: 2,
    },
    {
      id: "2",
      participantId: "user3",
      participantName: "Organizador do Torneio",
      participantAvatar: "https://via.placeholder.com/40",
      lastMessage: "Sua inscrição foi aprovada!",
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unread: 0,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    conversations[0] || null
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      conversationId: "1",
      senderId: "user2",
      senderName: "ProPlayer",
      content: "Olá! Como vai?",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "2",
      conversationId: "1",
      senderId: user?.id || "",
      senderName: user?.username || "Você",
      content: "Tudo bem! E você?",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      conversationId: "1",
      senderId: "user2",
      senderName: "ProPlayer",
      content: "Vamos fazer uma partida?",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="p-8 text-center text-zinc-400">A carregar…</p>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      // Simular envio de mensagem
      const newMessage: Message = {
        id: Date.now().toString(),
        conversationId: selectedConversation.id,
        senderId: user.id,
        senderName: user.username,
        content: messageText,
        createdAt: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      setMessageText("");

      // Atualizar última mensagem da conversa
      setConversations(
        conversations.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: messageText,
                lastMessageTime: new Date().toISOString(),
                unread: 0,
              }
            : c
        )
      );
    } finally {
      setSending(false);
    }
  };

  const selectedMessages = selectedConversation
    ? messages.filter((m) => m.conversationId === selectedConversation.id)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline"
        >
          ← Voltar ao início
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-indigo-300">
          💬 Mensagens
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 h-[70vh]">
        {/* Lista de Conversas */}
        <div className="glass-card rounded-2xl border border-violet-500/20 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-violet-500/20">
            <h2 className="text-sm font-semibold text-indigo-300">Conversas</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {conversations.length === 0 ? (
              <p className="p-4 text-center text-sm text-zinc-400">Sem conversas ainda.</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left rounded-lg p-3 transition-all flex items-center gap-3 ${
                    selectedConversation?.id === conv.id
                      ? "bg-indigo-500/20 border border-indigo-400/50"
                      : "hover:bg-violet-500/10 border border-transparent"
                  }`}
                >
                  <img
                    src={conv.participantAvatar || `https://ui-avatars.com/api/?name=${conv.participantName}`}
                    alt={conv.participantName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-200 truncate">
                      {conv.participantName}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="lg:col-span-2 glass-card rounded-2xl border border-violet-500/20 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-violet-500/20 p-4">
              <img
                src={selectedConversation.participantAvatar || `https://ui-avatars.com/api/?name=${selectedConversation.participantName}`}
                alt={selectedConversation.participantName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-zinc-200">
                  {selectedConversation.participantName}
                </p>
                <p className="text-xs text-zinc-400">Online</p>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      msg.senderId === user.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700/60 text-zinc-200"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === user.id ? "text-indigo-200" : "text-zinc-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 border-t border-violet-500/20 p-4"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escreve uma mensagem…"
                className="flex-1 rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
              />
              <Button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="rounded-lg px-4 py-2"
              >
                {sending ? "…" : "Enviar"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-2 glass-card rounded-2xl border border-violet-500/20 flex items-center justify-center">
            <p className="text-zinc-400">Seleciona uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
