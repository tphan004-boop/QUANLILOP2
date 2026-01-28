
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { ClassInfo } from '../../core/types';
import { Plus, Search, Edit2, Trash2, X, Save, School } from 'lucide-react';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassInfo | null>(null);
  const [formData, setFormData] = useState<Omit<ClassInfo, 'id'>>({
    className: '', schoolYear: '2023-2024', homeroomTeacher: '', note: ''
  });

  const fetchData = () => provider.getClasses().then(setClasses);
  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item?: ClassInfo) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        className: item.className, 
        schoolYear: item.schoolYear, 
        homeroomTeacher: item.homeroomTeacher, 
        note: item.note || '' 
      });
    } else {
      setEditingItem(null);
      setFormData({ className: '', schoolYear: '2023-2024', homeroomTeacher: '', note: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await provider.updateClass(editingItem.id, formData);
    } else {
      await provider.addClass(formData);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lớp này?')) {
      await provider.removeClass(id);
      fetchData();
    }
  };

  const filtered = classes.filter(c => 
    c.className.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.homeroomTeacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Danh sách Lớp học</h2>
          <p className="text-sm text-gray-500">Quản lý danh mục các lớp trong năm học</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18}/>
          <span>Thêm lớp</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên lớp hoặc giáo viên..." 
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tên lớp</th>
                <th className="px-6 py-4">Năm học</th>
                <th className="px-6 py-4">Giáo viên chủ nhiệm</th>
                <th className="px-6 py-4">Ghi chú</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-indigo-600">{c.className}</td>
                  <td className="px-6 py-4 text-gray-600">{c.schoolYear}</td>
                  <td className="px-6 py-4 font-medium">{c.homeroomTeacher}</td>
                  <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">{c.note}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(c)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg">{editingItem ? 'Sửa lớp học' : 'Thêm lớp mới'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên lớp</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} placeholder="Vd: 12A1"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Năm học</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.schoolYear} onChange={e => setFormData({...formData, schoolYear: e.target.value})} placeholder="Vd: 2023-2024"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GV Chủ nhiệm</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.homeroomTeacher} onChange={e => setFormData({...formData, homeroomTeacher: e.target.value})} placeholder="Vd: Nguyễn Văn A"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ghi chú</label>
                  <textarea className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" rows={3} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
                  <Save size={18}/>
                  <span>Lưu lại</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
