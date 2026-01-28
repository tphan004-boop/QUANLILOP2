
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Announcement, ClassInfo } from '../../core/types';
import { Plus, Search, Edit2, Trash2, X, Save, Pin, Megaphone } from 'lucide-react';

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState<Omit<Announcement, 'id'>>({
    classId: '',
    title: '',
    content: '',
    target: 'all',
    pinned: false,
    createdAt: new Date().toISOString(),
    author: 'GVCN'
  });

  const fetchData = async () => {
    const [cls, ann] = await Promise.all([
      provider.getClasses(),
      provider.getAnnouncements(selectedClassId || undefined)
    ]);
    setClasses(cls);
    setAnnouncements(ann);
    if (cls.length > 0 && !selectedClassId) {
      setSelectedClassId(cls[0].id);
      setFormData(prev => ({ ...prev, classId: cls[0].id }));
    }
  };

  useEffect(() => { fetchData(); }, [selectedClassId]);

  const handleOpenModal = (item?: Announcement) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        classId: item.classId,
        title: item.title,
        content: item.content,
        target: item.target,
        pinned: item.pinned,
        createdAt: item.createdAt,
        author: item.author
      });
    } else {
      setEditingItem(null);
      setFormData({
        classId: selectedClassId || (classes[0]?.id || ''),
        title: '',
        content: '',
        target: 'all',
        pinned: false,
        createdAt: new Date().toISOString(),
        author: 'GVCN'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await provider.updateAnnouncement(editingItem.id, formData);
    } else {
      await provider.addAnnouncement(formData);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa thông báo này?')) {
      await provider.removeAnnouncement(id);
      fetchData();
    }
  };

  const togglePin = async (item: Announcement) => {
    await provider.updateAnnouncement(item.id, { pinned: !item.pinned });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Thông báo lớp học</h2>
          <p className="text-sm text-gray-500">Gửi thông báo đến phụ huynh và học sinh</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18}/>
          <span>Thêm thông báo</span>
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
        {announcements.map(item => (
          <div key={item.id} className={`bg-white p-5 rounded-xl border ${item.pinned ? 'border-indigo-300 ring-1 ring-indigo-50 shadow-md' : 'border-gray-200'} transition hover:shadow-lg relative overflow-hidden`}>
            {item.pinned && <div className="absolute top-0 right-0 p-1 px-3 bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-bl-xl flex items-center gap-1"><Pin size={10} fill="currentColor"/> Đã ghim</div>}
            
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.target === 'all' ? 'bg-gray-100 text-gray-600' : item.target === 'parent' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                       Gửi: {item.target === 'all' ? 'Tất cả' : item.target === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                    </span>
                  </div>
               </div>
               <div className="flex gap-1">
                  <button onClick={() => togglePin(item)} className={`p-2 rounded-lg transition ${item.pinned ? 'text-indigo-600 bg-indigo-50' : 'text-gray-300 hover:text-indigo-600'}`} title="Ghim thông báo">
                    <Pin size={18} fill={item.pinned ? 'currentColor' : 'none'}/>
                  </button>
                  <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={18}/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
               </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{item.content}</div>
          </div>
        ))}
        {announcements.length === 0 && <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 italic">Chưa có thông báo nào cho lớp này</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="font-bold text-lg">{editingItem ? 'Sửa thông báo' : 'Thêm thông báo mới'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gửi tới lớp</label>
                    <select required className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đối tượng nhận</label>
                    <select className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value as any})}>
                      <option value="all">Tất cả</option>
                      <option value="parent">Chỉ Phụ huynh</option>
                      <option value="student">Chỉ Học sinh</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tiêu đề thông báo</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Vd: Lịch nghỉ Tết Nguyên Đán 2024"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nội dung chi tiết</label>
                  <textarea required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Nhập nội dung thông báo tại đây..."></textarea>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pinned" className="w-4 h-4 text-indigo-600 rounded" checked={formData.pinned} onChange={e => setFormData({...formData, pinned: e.target.checked})}/>
                  <label htmlFor="pinned" className="text-sm font-medium text-gray-700 cursor-pointer">Ghim thông báo này lên đầu danh sách</label>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2">
                  <Save size={18}/>
                  <span>Lưu thông báo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
