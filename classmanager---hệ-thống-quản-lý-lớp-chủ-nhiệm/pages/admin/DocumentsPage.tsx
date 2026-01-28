
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Document, ClassInfo } from '../../core/types';
import { Plus, Search, Edit2, Trash2, X, Save, FileText, ExternalLink, Filter } from 'lucide-react';

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);

  const [formData, setFormData] = useState<Omit<Document, 'id'>>({
    classId: '',
    title: '',
    url: '',
    category: 'Biểu mẫu',
    createdAt: new Date().toISOString()
  });

  const categories = ['Nội quy', 'Biểu mẫu', 'Kế hoạch', 'Học liệu', 'Khác'];

  const fetchData = async () => {
    const [cls, docs] = await Promise.all([
      provider.getClasses(),
      provider.getDocuments(selectedClassId || undefined)
    ]);
    setClasses(cls);
    setDocuments(docs);
    if (cls.length > 0 && !selectedClassId) {
      setSelectedClassId(cls[0].id);
      setFormData(prev => ({ ...prev, classId: cls[0].id }));
    }
  };

  useEffect(() => { fetchData(); }, [selectedClassId]);

  const handleOpenModal = (item?: Document) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        classId: item.classId,
        title: item.title,
        url: item.url,
        category: item.category,
        createdAt: item.createdAt
      });
    } else {
      setEditingItem(null);
      setFormData({
        classId: selectedClassId || (classes[0]?.id || ''),
        title: '',
        url: '',
        category: 'Biểu mẫu',
        createdAt: new Date().toISOString()
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await provider.updateDocument(editingItem.id, formData);
    } else {
      await provider.addDocument(formData);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa tài liệu này?')) {
      await provider.removeDocument(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Hồ sơ & Học liệu</h2>
          <p className="text-sm text-gray-500">Quản lý các tệp tin, biểu mẫu dùng chung cho lớp</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18}/>
          <span>Thêm tài liệu</span>
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tên tài liệu</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4">Ngày tải lên</th>
                <th className="px-6 py-4">Liên kết</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center">
                          <FileText size={16}/>
                       </div>
                       <span className="font-medium text-gray-900">{d.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">{d.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 text-xs">
                      Mở link <ExternalLink size={12}/>
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => handleOpenModal(d)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Chưa có tài liệu nào cho lớp này</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="font-bold text-lg">{editingItem ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lớp học</label>
                  <select required className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên tài liệu / Tiêu đề</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Vd: Nội quy phòng học tin học"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại tài liệu</label>
                  <select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đường dẫn tệp (URL)</label>
                  <input required type="url" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://drive.google.com/file/..."/>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Lưu tài liệu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
