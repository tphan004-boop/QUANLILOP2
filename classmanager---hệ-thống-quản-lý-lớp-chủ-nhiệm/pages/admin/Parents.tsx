
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Parent, Student } from '../../core/types';
import { Plus, Search, Edit2, Trash2, X, Save, Phone, Mail } from 'lucide-react';

const Parents: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Parent | null>(null);
  
  const [formData, setFormData] = useState<Omit<Parent, 'id'>>({
    fullName: '', phone: '', email: '', relationship: 'Cha', studentId: ''
  });

  const fetchData = async () => {
    const [p, s] = await Promise.all([provider.getParents(), provider.getStudents()]);
    setParents(p);
    setStudents(s);
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item?: Parent) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        fullName: item.fullName, phone: item.phone, email: item.email, 
        relationship: item.relationship, studentId: item.studentId 
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        fullName: '', phone: '', email: '', 
        relationship: 'Cha', studentId: students[0]?.id || '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await provider.updateParent(editingItem.id, formData);
    } else {
      await provider.addParent(formData);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa thông tin phụ huynh này?')) {
      await provider.removeParent(id);
      fetchData();
    }
  };

  const filtered = parents.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Danh mục Phụ huynh</h2>
          <p className="text-sm text-gray-500">Quản lý thông tin liên hệ và mối quan hệ</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18}/>
          <span>Thêm phụ huynh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Tìm theo tên hoặc SĐT..." className="bg-transparent border-none outline-none text-sm w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Phụ huynh</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Quan hệ</th>
                <th className="px-6 py-4">Học sinh liên kết</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.fullName}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600"><Phone size={12}/> {p.phone}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-600"><Mail size={12}/> {p.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.relationship}</td>
                  <td className="px-6 py-4">
                    <span className="text-indigo-600 font-medium">{students.find(s => s.id === p.studentId)?.fullName || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(p)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg">{editingItem ? 'Sửa phụ huynh' : 'Thêm phụ huynh mới'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Họ và tên</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Vd: Nguyễn Văn Phụ"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số điện thoại</label>
                    <input required type="tel" className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quan hệ</label>
                    <select className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})}>
                       <option value="Cha">Cha</option>
                       <option value="Mẹ">Mẹ</option>
                       <option value="Giám hộ">Giám hộ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input type="email" className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Học sinh liên kết</label>
                  <select required className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                     {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>)}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parents;
