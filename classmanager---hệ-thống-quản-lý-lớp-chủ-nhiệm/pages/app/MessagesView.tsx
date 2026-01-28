
import React, { useEffect, useState, useRef } from 'react';
import provider from '../../core/provider';
import { Message, MessageThread, Student } from '../../core/types';
import { Send, User, ShieldCheck, Info } from 'lucide-react';

const MessagesView: React.FC = () => {
  const [child, setChild] = useState<Student | null>(null);
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const students = await provider.getStudents();
      const firstChild = students[0]; // Mock
      if (firstChild) {
        setChild(firstChild);
        const t = await provider.getOrCreateThread(firstChild.id);
        setThread(t);
        const m = await provider.getMessages(t.id);
        setMessages(m);
      }
    };
    loadData();
    
    const interval = setInterval(() => {
       if (thread) {
          provider.getMessages(thread.id).then(setMessages);
       }
    }, 5000);
    return () => clearInterval(interval);
  }, [thread?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !thread || !child) return;
    
    setIsSubmitting(true);
    const content = newMessage;
    setNewMessage('');
    
    await provider.sendMessage({
      threadId: thread.id,
      fromRole: 'PARENT', // In mock we assume parent is messaging
      senderId: child.parentId,
      content
    });
    
    const updated = await provider.getMessages(thread.id);
    setMessages(updated);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-160px)] space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-indigo-100">
               GV
            </div>
            <div>
               <h3 className="font-bold text-gray-900">Thầy {child?.classId === 'c1' ? 'Nguyễn Văn A' : 'Chủ nhiệm'}</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Giáo viên chủ nhiệm lớp {child?.classId === 'c1' ? '12A1' : ''}</p>
            </div>
         </div>
         <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
            <ShieldCheck size={16} className="text-green-600"/>
            <span className="text-[10px] font-bold text-green-700 uppercase">Kênh liên lạc chính thức</span>
         </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
         <div className="bg-gray-50/50 p-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
            Hôm nay
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex justify-center">
               <div className="bg-blue-50 text-blue-700 text-[10px] px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
                  <Info size={12}/> Phụ huynh vui lòng trao đổi các vấn đề liên quan đến việc học và nề nếp của con.
               </div>
            </div>

            {messages.map(m => {
               const isMe = m.fromRole === 'PARENT';
               return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black mr-2 mt-auto">GV</div>
                     )}
                     <div className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-50 rounded-bl-none'}`}>
                        <p className="leading-relaxed">{m.content}</p>
                        <p className={`text-[9px] mt-2 font-medium uppercase tracking-tighter opacity-70`}>
                           {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
               );
            })}
            <div ref={messagesEndRef} />
         </div>

         <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="Nhập lời nhắn gửi đến Giáo viên..." 
                 className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                 value={newMessage}
                 onChange={e => setNewMessage(e.target.value)}
                 disabled={isSubmitting}
               />
               <button 
                 type="submit" 
                 disabled={isSubmitting || !newMessage.trim()}
                 className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50 shadow-xl shadow-indigo-100"
               >
                 <Send size={20} />
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default MessagesView;
