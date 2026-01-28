
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Task, TaskReply, Student } from '../../core/types';
// Fix: Added missing Plus icon to imports
import { ClipboardList, Clock, AlertTriangle, CheckCircle2, Send, Paperclip, X, Plus } from 'lucide-react';

const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [replies, setReplies] = useState<TaskReply[]>([]);
  const [child, setChild] = useState<Student | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [replyText, setReplyText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    const students = await provider.getStudents();
    const firstChild = students[0]; 
    if (firstChild) {
      setChild(firstChild);
      const [tList, rList] = await Promise.all([
        provider.getTasks(firstChild.classId),
        // Simple logic: we might need a getTaskRepliesByStudent but here we filter mock data
        provider.getTaskReplies('') // Not used correctly in mockup, let's fix
      ]);
      // For mock simplicity, let's fetch all replies and filter
      // In a real app we'd have a specific endpoint
      setTasks(tList);
      
      // Load all replies to check status
      const allRepliesPromises = tList.map(t => provider.getTaskReplies(t.id));
      const allReplies = (await Promise.all(allRepliesPromises)).flat();
      setReplies(allReplies.filter(r => r.studentId === firstChild.id));
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !child) return;
    setIsSubmitting(true);
    try {
      await provider.replyTask({
        taskId: selectedTask.id,
        studentId: child.id,
        parentId: child.parentId,
        replyText,
        attachmentsJson: JSON.stringify(attachments)
      });
      setReplyText('');
      setAttachments([]);
      setSelectedTask(null);
      fetchData();
      alert('Đã nộp phản hồi thành công!');
    } catch (err) {
      alert('Lỗi khi nộp phản hồi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAttachment = () => {
    if (attachmentUrl) {
      setAttachments([...attachments, attachmentUrl]);
      setAttachmentUrl('');
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Việc cần làm / Bài tập</h2>
          <p className="text-gray-500">Các yêu cầu từ giáo viên dành cho em {child?.fullName}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.map(task => {
          const reply = replies.find(r => r.taskId === task.id);
          const isOverdue = new Date(task.dueDate) < new Date() && !reply;
          const isDueSoon = !isOverdue && !reply && (new Date(task.dueDate).getTime() - Date.now() < 86400000);

          return (
            <div key={task.id} className={`bg-white rounded-2xl border transition-all ${reply ? 'border-green-100 bg-green-50/20' : isOverdue ? 'border-red-100 ring-1 ring-red-50' : 'border-gray-100 shadow-sm'}`}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                      {reply && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase"><CheckCircle2 size={12}/> Đã hoàn thành</span>}
                      {isOverdue && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase"><AlertTriangle size={12}/> Quá hạn nộp</span>}
                      {isDueSoon && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase"><Clock size={12}/> Sắp đến hạn</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-gray-400">
                       <span className="flex items-center gap-1 uppercase tracking-tight"><Clock size={12}/> Hạn chót: {new Date(task.dueDate).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</div>
                  </div>
                  {!reply && (
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="shrink-0 w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                      {task.requireReply ? 'Nộp phản hồi' : 'Đã rõ'}
                    </button>
                  )}
                </div>
                {reply && (
                  <div className="mt-4 pt-4 border-t border-green-100 bg-green-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                     <p className="text-[10px] font-bold text-green-600 uppercase mb-2">Thông tin phản hồi của bạn:</p>
                     <p className="text-sm text-gray-700 italic">"{reply.replyText}"</p>
                     {reply.attachmentsJson !== '[]' && (
                       <div className="mt-3 flex flex-wrap gap-2">
                          {JSON.parse(reply.attachmentsJson).map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold hover:underline">Đính kèm {i+1}</a>
                          ))}
                       </div>
                     )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400 italic">Hiện chưa có bài tập hay nhiệm vụ nào</div>}
      </div>

      {/* Reply Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto">
            <form onSubmit={handleReplySubmit}>
               <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                  <h3 className="font-bold text-lg">Phản hồi nhiệm vụ</h3>
                  <button type="button" onClick={() => setSelectedTask(null)}><X size={20}/></button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                     <h4 className="font-bold text-indigo-900 text-sm mb-1">{selectedTask.title}</h4>
                     <p className="text-xs text-indigo-700 line-clamp-2">{selectedTask.description}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nội dung phản hồi / Bài làm</label>
                    <textarea 
                      required 
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                      rows={5} 
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung trả lời cho giáo viên..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đính kèm liên kết (Vd: Google Drive, Ảnh...)</label>
                    <div className="flex gap-2">
                       <input 
                         type="url" 
                         className="flex-1 border rounded-lg px-3 py-2 outline-none" 
                         value={attachmentUrl} 
                         onChange={e => setAttachmentUrl(e.target.value)} 
                         placeholder="https://..."
                       />
                       {/* Fix: Added missing Plus icon to UI */}
                       <button type="button" onClick={addAttachment} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Plus size={18}/></button>
                    </div>
                    <div className="mt-2 space-y-1">
                       {attachments.map((url, i) => (
                         <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs text-gray-600">
                            <span className="truncate flex-1">{url}</span>
                            <button type="button" onClick={() => removeAttachment(i)} className="text-red-500 hover:text-red-700 px-1"><X size={14}/></button>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
               <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                  <button type="button" onClick={() => setSelectedTask(null)} className="px-4 py-2 text-sm text-gray-600">Đóng</button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition disabled:opacity-50">
                     <Send size={18}/>
                     <span>{isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
