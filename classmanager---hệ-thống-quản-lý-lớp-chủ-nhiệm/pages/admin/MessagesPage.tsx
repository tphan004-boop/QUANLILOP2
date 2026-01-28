
import React, { useEffect, useState, useRef } from 'react';
import provider from '../../core/provider';
import { Message, MessageThread, Student, ClassInfo } from '../../core/types';
import { Search, Send, User, MessageSquare, Filter } from 'lucide-react';

const MessagesPage: React.FC = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    const [t, s, c] = await Promise.all([
      provider.getMessageThreads(),
      provider.getStudents(),
      provider.getClasses()
    ]);
    setThreads(t);
    setStudents(s);
    setClasses(c);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedThread) {
      provider.getMessages(selectedThread.id).then(setMessages);
      const interval = setInterval(() => {
        provider.getMessages(selectedThread.id).then(setMessages);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    
    const content = newMessage;
    setNewMessage('');
    
    await provider.sendMessage({
      threadId: selectedThread.id,
      fromRole: 'TEACHER',
      senderId: 'admin',
      content
    });
    
    const updated = await provider.getMessages(selectedThread.id);
    setMessages(updated);
    fetchData(); // Refresh threads list for last message text
  };

  const startNewChat = async (studentId: string) => {
    const thread = await provider.getOrCreateThread(studentId);
    setSelectedThread(thread);
    setSearchTerm('');
  };

  const filteredThreads = threads.filter(t => {
    const student = students.find(s => s.id === t.threadKey);
    const matchesSearch = student?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClassId ? student?.classId === selectedClassId : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-gray-50/50">
        <div className="p-4 border-b space-y-3 bg-white">
          <h2 className="font-bold text-lg">Hộp thư đến</h2>
          <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Tìm người nhắn..." 
               className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select 
              className="text-xs bg-transparent outline-none font-medium text-gray-500"
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
            >
              <option value="">Tất cả lớp</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs italic">Không tìm thấy cuộc hội thoại nào</div>
          ) : (
            filteredThreads.map(t => {
              const student = students.find(s => s.id === t.threadKey);
              const isActive = selectedThread?.id === t.id;
              return (
                <button 
                  key={t.id} 
                  onClick={() => setSelectedThread(t)}
                  className={`w-full p-4 flex gap-3 text-left border-b border-gray-100 transition-colors ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-white'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                    {student?.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-sm text-gray-900 truncate">{student?.fullName}</span>
                       <span className="text-[10px] text-gray-400">{new Date(t.lastMessageAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{t.lastMessageText || 'Chưa có tin nhắn'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedThread ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-white sticky top-0 z-10">
               <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                 {students.find(s => s.id === selectedThread.threadKey)?.fullName.charAt(0)}
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">{students.find(s => s.id === selectedThread.threadKey)?.fullName}</h3>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Trực tuyến</p>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
               {messages.map(m => {
                 const isMe = m.fromRole === 'TEACHER';
                 return (
                   <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                         <p>{m.content}</p>
                         <p className={`text-[9px] mt-1 ${isMe ? 'text-indigo-100' : 'text-gray-400'}`}>
                           {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                   </div>
                 );
               })}
               <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white">
               <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Nhập nội dung tin nhắn..." 
                    className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                    <Send size={20} />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-900">Chọn một cuộc trò chuyện</h3>
             <p className="text-gray-500 max-w-sm mt-2">Chọn phụ huynh từ danh sách bên trái hoặc tìm kiếm học sinh để bắt đầu trao đổi thông tin.</p>
             <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
                {students.slice(0, 4).map(s => (
                  <button key={s.id} onClick={() => startNewChat(s.id)} className="p-3 bg-white border border-gray-100 rounded-xl text-left hover:border-indigo-300 hover:bg-indigo-50 transition">
                     <p className="text-xs font-bold text-gray-900 truncate">{s.fullName}</p>
                     <p className="text-[10px] text-gray-400">Gửi lời nhắn ngay</p>
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
