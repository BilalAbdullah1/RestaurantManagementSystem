import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import ImageUpload from '../../components/form/ImageUpload';
import { MessageSquare, Send, Hash, UserCheck, ShieldCheck, Paperclip, Smile } from 'lucide-react';

interface StaffChatMessage {
  id: string;
  tenant_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id?: string;
  channel: string;
  message_text: string;
  attachment_url?: string;
  sent_at: string;
}

export default function StaffChatPlatform() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const currentUserName = localStorage.getItem("userName") || "Staff Member";
  const currentUserId = localStorage.getItem("userId") || "11111111-1111-1111-1111-111111111111";
  const [searchParams] = useSearchParams();

  const [activeChannel, setActiveChannel] = useState<'General' | 'Teachers-Lounge' | 'Admin-Office'>('General');
  const [messages, setMessages] = useState<StaffChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [messageText, setMessageText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<StaffChatMessage[]>(`/staffchat/channel/${activeChannel}/tenant/${tenantId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load chat history.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000); // Polling every 5 sec for real-time experience
    return () => clearInterval(interval);
  }, [activeChannel, tenantId]);

  useEffect(() => {
    const channelParam = searchParams.get('channel');
    if (channelParam && ['General', 'Teachers-Lounge', 'Admin-Office'].includes(channelParam)) {
      setActiveChannel(channelParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !attachmentUrl) return;

    setSending(true);
    try {
      await api.post('/staffchat/send', {
        tenant_id: tenantId,
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_role: 'Teacher',
        channel: activeChannel,
        message_text: messageText,
        attachment_url: attachmentUrl
      });

      setMessageText('');
      setAttachmentUrl(null);
      fetchMessages();
    } catch (err) {
      Swal.fire('Error', 'Could not send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col">
      
      {/* BREADCRUMB & HEADER */}
      <div className="mb-4">
        <Breadcrumb items={[{ label: 'Communication & Helpdesk', href: '#' }, { label: 'Internal Staff Chat Platform' }]} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
          <MessageSquare className="w-7 h-7 text-indigo-600" />
          Internal Staff & Faculty Messenger
        </h2>
      </div>

      {/* MESSENGER CONTAINER */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex overflow-hidden">
        
        {/* LEFT CHANNELS SIDEBAR */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800/40 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Staff Channels</h3>
          </div>

          <div className="p-3 space-y-1">
            {[
              { id: 'General', label: 'General Lounge', icon: <Hash className="w-4 h-4 text-emerald-500" /> },
              { id: 'Teachers-Lounge', label: 'Teachers Hub', icon: <Hash className="w-4 h-4 text-blue-500" /> },
              { id: 'Admin-Office', label: 'Admin Desk', icon: <ShieldCheck className="w-4 h-4 text-purple-500" /> },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeChannel === ch.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/50'
                }`}
              >
                {ch.icon}
                {ch.label}
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 font-bold flex items-center justify-center text-sm">
                {currentUserName.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{currentUserName}</p>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                  ● Online (Active)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CHAT STREAM */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-gray-900">
          
          {/* TOP CHANNEL BAR */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-indigo-500" />
                #{activeChannel}
              </h3>
              <p className="text-xs text-gray-500">Secure staff discussion & announcements channel.</p>
            </div>
            <Badge variant="light" color="success">Internal Encrypted</Badge>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <MessageSquare className="w-12 h-12 text-indigo-400 mb-2" />
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Start the conversation</h4>
                <p className="text-xs text-gray-500">No messages in #{activeChannel} yet.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_name === currentUserName;
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isMe ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {msg.sender_name.charAt(0)}
                    </div>
                    <div>
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{msg.sender_name}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700/60'
                      }`}>
                        {msg.message_text}
                        {msg.attachment_url && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="text-xs underline flex items-center gap-1 font-bold">
                              <Paperclip className="w-3.5 h-3.5" /> Attachment Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* BOTTOM COMPOSER */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
            <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder={`Message #${activeChannel}...`}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3" disabled={sending}>
                <Send className="w-4 h-4 mr-1" />
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
