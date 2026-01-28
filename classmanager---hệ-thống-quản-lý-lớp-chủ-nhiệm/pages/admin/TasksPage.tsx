
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Task, TaskReply, ClassInfo, Student } from '../../core/types';
import { Plus, Search, Edit2, Trash2, X, Save, ClipboardList, CheckCircle2, Circle, Clock, MessageSquareText } from 'lucide-react';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRepliesModalOpen, setIsRepliesModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Task | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [replies, setReplies] = useState<TaskReply[]>([]);

  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt'>>({
    classId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    requireReply: true
  });

  const fetchData = async () => {
    const [cls, allTasks] = await Promise.all([
      provider.getClasses(),
      provider.getTasks(selectedClassId || undefined)
    ]);
    setClasses(cls);
    setTasks(allTasks);
    if (cls.length > 0 && !selectedClassId) {
      setSelectedClassId(cls[0].id);
      setFormData(prev => ({ ...prev, classId: cls[0].id }));
    }
  };

  useEffect(() => { fetchData(); }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassId) {
      provider.getStudents(selectedClassId).then(setStudents);
    }
  }, [selectedClassId]);

  const handleOpenModal = (item?: Task) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        classId: item.classId,
        title: item.title,
        description: item.description,
        dueDate: new Date(item.dueDate).toISOString().slice(0, 16),
        requireReply: item.requireReply
      });
    } else {
      setEditingItem(null);
      setFormData({
        classId: selectedClassId || (classes[0]?.id || ''),
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        requireReply: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, dueDate: new Date(formData.dueDate).toISOString() };
    if (editingItem) {
      await provider.updateTask(editingItem.id, data);
    } else {
      await provider.addTask({ ...data, createdAt: new Date().toISOString() });
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa lời nhắc việc/bài tập này?')) {
      await provider.removeTask(id);
      fetchData();
    }
  };

  const showReplies = async (task: Task) => {
    const reps = await provider.getTaskReplies(task.id);
    setCurrentTask(task);
    setReplies(reps);
    setIsRepliesModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Nhắc việc / Bài tập</h2>
          <p className="text-sm text-gray-500">Giao nhiệm vụ và theo dõi phản hồi từ phụ huynh</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18}/>
          <span>Thêm nhiệm vụ</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <select 
          className="border rounded-lg px-3 py-2 text-sm outline-none bg-white min-w-[150px]" 
          value={selectedClassId} 
          onChange={e => setSelectedClassId(e.target.value)}
        >
          {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.className}</option>)}
        </select>
      </div>

      <div className="grid gap-4">
        {tasks.map(task => {
          const isOverdue = new Date(task.dueDate) < new Date();
          return (
            <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition">
               <div className="flex justify-between items-start">
                  <div>
                     <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                        {task.requireReply && <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Cần phản hồi</span>}
                     </div>
                     <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1 font-semibold">
                           <Clock size={12}/> Hạn: {new Date(task.dueDate).toLocaleString('vi-VN')}
                        </span>
                        {isOverdue && <span className="text-red-500 font-bold uppercase tracking-tight">Quá hạn</span>}
                     </div>
                  </div>
                  <div className="flex gap-1">
                     <button onClick={() => showReplies(task)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2 text-xs font-bold" title="Xem phản hồi">
                        <MessageSquareText size={18}/>
                        <span>Xem phản hồi</span>
                     </button>
                     <button onClick={() => handleOpenModal(task)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={18}/></button>
                     <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                  </div>
               </div>
               <p className="mt-3 text-sm text-gray-600 line-clamp-2">{task.description}</p>
            </div>
          );
        })}
        {tasks.length === 0 && <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 italic">Chưa có nhiệm vụ nào cho lớp này</div>}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="font-bold text-lg">{editingItem ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ mới'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tiêu đề nhiệm vụ / Bài tập</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Vd: Bài tập cuối tuần môn Toán"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mô tả chi tiết</label>
                  <textarea required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Nhập yêu cầu cụ thể tại đây..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hạn chót</label>
                    <input required type="datetime-local" className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}/>
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" checked={formData.requireReply} onChange={e => setFormData({...formData, requireReply: e.target.checked})}/>
                      <span className="text-sm font-medium text-gray-700">Yêu cầu phụ huynh phản hồi</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Lưu nhiệm vụ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replies Modal */}
      {isRepliesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
               <div>
                  <h3 className="font-bold text-lg">Danh sách phản hồi</h3>
                  <p className="text-xs text-gray-500 truncate max-w-md">{currentTask?.title}</p>
               </div>
               <button type="button" onClick={() => setIsRepliesModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
               <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold sticky top-0 z-10 border-b">
                     <tr>
                        <th className="px-6 py-3">Học sinh</th>
                        <th className="px-6 py-3">Trạng thái</th>
                        <th className="px-6 py-3">Phản hồi của PH</th>
                        <th className="px-6 py-3">Thời gian</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {students.map(s => {
                        const reply = replies.find(r => r.studentId === s.id);
                        return (
                           <tr key={s.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900">{s.fullName}</td>
                              <td className="px-6 py-4">
                                 {reply ? 
                                    <span className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase"><CheckCircle2 size={12}/> Đã nộp</span> : 
                                    <span className="flex items-center gap-1 text-gray-400 font-bold text-[10px] uppercase"><Circle size={12}/> Chưa nộp</span>
                                 }
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-600 italic">
                                 {reply?.replyText || '-'}
                                 {reply?.attachmentsJson && reply.attachmentsJson !== '[]' && (
                                   <div className="mt-1 flex gap-1">
                                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded font-bold">Có đính kèm</span>
                                   </div>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-[10px] text-gray-400">
                                 {reply ? new Date(reply.createdAt).toLocaleString('vi-VN') : '-'}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center">
               <span className="text-xs text-gray-500 font-medium">Hoàn thành: {replies.length} / {students.length}</span>
               <button onClick={() => setIsRepliesModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
