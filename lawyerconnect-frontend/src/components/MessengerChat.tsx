'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Send, 
  X, 
  MessageSquare, 
  User, 
  Search, 
  CheckCheck, 
  Clock, 
  Phone, 
  Video, 
  ShieldCheck, 
  Sparkles,
  Paperclip
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  message: string;
  sentAt: string;
  isRead: boolean;
}

export interface ChatPartner {
  id: number;
  name: string;
  username: string;
  role: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface MessengerChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialPartner?: {
    id: number;
    name: string;
    role?: string;
    avatarUrl?: string;
  } | null;
  currentUserId?: number;
}

export default function MessengerChat({
  isOpen,
  onClose,
  initialPartner,
  currentUserId
}: MessengerChatProps) {
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load partners on mount / open
  useEffect(() => {
    if (isOpen) {
      loadChatPartners();
    }
  }, [isOpen]);

  // Set initial partner if provided
  useEffect(() => {
    if (initialPartner) {
      const partnerObj: ChatPartner = {
        id: initialPartner.id,
        name: initialPartner.name,
        username: '',
        role: initialPartner.role || 'LAWYER',
        avatarUrl: initialPartner.avatarUrl
      };

      setActivePartner(partnerObj);
      
      // Ensure partner is in list
      setPartners(prev => {
        if (!prev.some(p => p.id === initialPartner.id)) {
          return [partnerObj, ...prev];
        }
        return prev;
      });

      loadConversation(initialPartner.id);
    }
  }, [initialPartner]);

  // Polling for live messages when conversation is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && activePartner) {
      interval = setInterval(() => {
        loadConversation(activePartner.id, true);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activePartner]);

  const loadChatPartners = async () => {
    setLoadingPartners(true);
    try {
      const res = await apiClient.get('/api/v1/messages/partners');
      if (res.data?.data) {
        setPartners(res.data.data);
        if (!activePartner && res.data.data.length > 0 && !initialPartner) {
          setActivePartner(res.data.data[0]);
          loadConversation(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load chat partners', err);
    } finally {
      setLoadingPartners(false);
    }
  };

  const loadConversation = async (partnerId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await apiClient.get(`/api/v1/messages/conversation/${partnerId}`);
      if (res.data?.data) {
        setMessages(res.data.data);
        if (!silent) setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activePartner || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await apiClient.post('/api/v1/messages/send', {
        receiverId: activePartner.id,
        message: messageText
      });

      if (res.data?.data) {
        setMessages(prev => [...prev, res.data.data]);
        setTimeout(scrollToBottom, 100);
        loadChatPartners(); // update last message snippet
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative font-sans text-zinc-100">
        
        {/* MESSENGER TOP BAR */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                LawyerConnect Direct Messenger
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold">LIVE CHAT</span>
              </h3>
              <p className="text-[11px] text-zinc-400">Encrypted Advocate-Client Direct Consult Channel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MESSENGER BODY */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR: CONTACTS LIST */}
          <div className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 hidden sm:flex">
            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-800">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Contacts Scrollable */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingPartners ? (
                <p className="text-zinc-500 text-xs text-center py-6">Loading conversations...</p>
              ) : filteredPartners.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 space-y-2">
                  <p>No chat history yet.</p>
                  <p className="text-[10px] text-zinc-500">Click "Message Advocate" on any lawyer profile to start messaging!</p>
                </div>
              ) : (
                filteredPartners.map(partner => {
                  const isActive = activePartner?.id === partner.id;
                  return (
                    <button
                      key={partner.id}
                      onClick={() => {
                        setActivePartner(partner);
                        loadConversation(partner.id);
                      }}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 ${
                        isActive 
                          ? 'bg-white text-zinc-950 font-bold shadow-sm' 
                          : 'hover:bg-zinc-900 text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center overflow-hidden ${
                          isActive ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-900 border-zinc-800'
                        }`}>
                          {partner.avatarUrl ? (
                            <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className={`w-5 h-5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                          )}
                        </div>
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 absolute -bottom-0.5 -right-0.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-bold truncate ${isActive ? 'text-zinc-950' : 'text-white'}`}>{partner.name}</span>
                          <span className={`text-[10px] shrink-0 font-mono ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>
                            {formatTime(partner.lastMessageTime)}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate ${isActive ? 'text-zinc-700' : 'text-zinc-400'}`}>
                          {partner.lastMessage || 'Click to view conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className="flex-1 flex flex-col bg-zinc-900/50">
            {activePartner ? (
              <>
                {/* Active Partner Header */}
                <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                        {activePartner.avatarUrl ? (
                          <img src={activePartner.avatarUrl} alt={activePartner.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-950 absolute bottom-0 right-0" />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {activePartner.name}
                        {activePartner.role === 'LAWYER' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {activePartner.role === 'LAWYER' ? 'BASL High Court Advocate • Active Online' : 'Verified Client'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Direct Call feature initiated for ${activePartner.name}`)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all"
                      title="Initiate Audio Call"
                    >
                      <Phone className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => alert(`Video Consultation link generated for ${activePartner.name}`)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all"
                      title="Start Video Session"
                    >
                      <Video className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-zinc-500">Loading conversation history...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h5 className="text-sm font-bold text-white">Start Conversation with {activePartner.name}</h5>
                      <p className="text-xs text-zinc-400 max-w-sm">
                        Send legal queries, consultation requests, or document references directly.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = currentUserId ? msg.senderId === currentUserId : msg.senderName !== activePartner.name;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed ${
                            isMe 
                              ? 'bg-white text-zinc-950 font-medium rounded-tr-none shadow-md' 
                              : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700 shadow-md'
                          }`}>
                            <p>{msg.message}</p>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 px-1 font-mono">
                            <span>{formatTime(msg.sentAt)}</span>
                            {isMe && (
                              <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-white' : 'text-zinc-500'}`} />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Field */}
                <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0 space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px]">
                    <span className="text-zinc-500 font-bold shrink-0">Quick Queries:</span>
                    {[
                      'Available for consultation today?',
                      'Please review my case brief',
                      'Requesting fee breakdown',
                      'Can we schedule an online session?'
                    ].map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInputText(tag)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 shrink-0 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert('Document attachment feature: Select PDF/Image')}
                      className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      placeholder={`Message ${activePartner.name}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-colors"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className="px-5 py-3 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-zinc-400">
                <p>Select a contact from the left panel to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
