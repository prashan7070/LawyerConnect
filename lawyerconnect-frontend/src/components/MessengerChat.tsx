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
  Paperclip,
  Lock,
  ChevronRight
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      loadChatPartners();
    }
  }, [isOpen]);

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
      
      setPartners(prev => {
        if (!prev.some(p => p.id === initialPartner.id)) {
          return [partnerObj, ...prev];
        }
        return prev;
      });

      loadConversation(initialPartner.id);
    }
  }, [initialPartner]);

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
        loadChatPartners();
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-5xl h-[86vh] flex flex-col shadow-2xl overflow-hidden relative font-sans text-slate-900">
        
        {/* MESSENGER TOP BAR */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                LawyerConnect Direct Channel
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ENCRYPTED
                </span>
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-indigo-400 inline" /> Direct & Confidential Advocate Consultation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center border border-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MESSENGER BODY */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR: CONTACTS LIST */}
          <div className="w-80 border-r border-slate-200 bg-slate-50/70 flex flex-col shrink-0 hidden sm:flex">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200/80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            {/* Contacts Scrollable */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {loadingPartners ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading conversations...</div>
              ) : filteredPartners.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-600">No chat history yet</p>
                  <p className="text-[11px]">Click "Direct Message" on any lawyer card to start chatting!</p>
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
                          ? 'bg-white text-indigo-950 font-semibold border border-indigo-200 shadow-sm' 
                          : 'hover:bg-slate-200/60 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden ${
                          isActive ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-200 border-slate-300'
                        }`}>
                          {partner.avatarUrl ? (
                            <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                          )}
                        </div>
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5 shadow-sm" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-bold truncate ${isActive ? 'text-indigo-950' : 'text-slate-900'}`}>{partner.name}</span>
                          <span className={`text-[10px] shrink-0 ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                            {formatTime(partner.lastMessageTime)}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate ${isActive ? 'text-indigo-700/90' : 'text-slate-500'}`}>
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
          <div className="flex-1 flex flex-col bg-white">
            {activePartner ? (
              <>
                {/* Active Partner Header */}
                <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center overflow-hidden">
                        {activePartner.avatarUrl ? (
                          <img src={activePartner.avatarUrl} alt={activePartner.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold font-display text-slate-900 flex items-center gap-1.5">
                        {activePartner.name}
                        {activePartner.role === 'LAWYER' && (
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {activePartner.role === 'LAWYER' ? 'BASL Registered Advocate • Online' : 'Verified Client'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Direct Call feature initiated for ${activePartner.name}`)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-all"
                      title="Initiate Audio Call"
                    >
                      <Phone className="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => alert(`Video Consultation link generated for ${activePartner.name}`)}
                      className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all border border-indigo-200"
                      title="Start Video Session"
                    >
                      <Video className="w-4 h-4 text-indigo-600" />
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-slate-400">Loading conversation history...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <h5 className="text-base font-bold font-display text-slate-900">Start Conversation with {activePartner.name}</h5>
                      <p className="text-xs text-slate-500 max-w-sm">
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
                          <div className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-gradient-to-r from-indigo-600 to-slate-900 text-white font-normal shadow-md shadow-indigo-500/10 rounded-tr-none' 
                              : 'bg-white text-slate-800 border border-slate-200/90 shadow-xs rounded-tl-none'
                          }`}>
                            <p className="text-xs">{msg.message}</p>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 px-1 font-medium">
                            <span>{formatTime(msg.sentAt)}</span>
                            {isMe && (
                              <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-indigo-600' : 'text-slate-400'}`} />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Field */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200/80 shrink-0 space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-slate-400 font-semibold shrink-0">Quick Options:</span>
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
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 border border-slate-200 shrink-0 transition-all font-medium"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => alert('Document attachment feature: Select PDF/Image')}
                      className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition-all"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      placeholder={`Message ${activePartner.name}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0"
                    >
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-slate-400">
                <p>Select a contact from the left panel to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
