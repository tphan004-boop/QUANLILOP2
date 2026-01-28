
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Student, ClassInfo, Behavior } from '../../core/types';
import { Plus, Search, Edit2, Trash2, X, Save, Star, AlertTriangle, Filter, FileDown } from 'lucide-react';

const BehaviorPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Behavior | null>(null);

  const [formData, setFormData] = useState<Omit<Behavior, 'id'>>({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'PRAISE',
    content: '',
    points: 5
  });

  const fetchData = async () => {
    const [cls, allBehaviors] = await Promise.all([
      provider.getClasses(),
      provider.getBehaviors()
    ]);
    setClasses(cls);
    setBehaviors(allBehaviors);
    if (cls.length > 0 && !selectedClassId) setSelectedClassId(cls[0].id);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedClassId) {
      provider.getStudents(selectedClassId).then(setStudents);
    }
  }, [selectedClassId]);

  const handleOpenModal = (item?: Behavior) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        studentId: item.studentId,
        date: item.date,
        type: item.type,
        content: item.content,
        points: item.points
      });
    } else {
      setEditingItem(null);
      setFormData({
        studentId: students[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        type: 'PRAISE',
        content: '',
        points: 5
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await provider.updateBehavior(editingItem.id, formData);
    } else {
      await provider.addBehavior(formData);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa ghi nhận nề nếp này?')) {
      await provider.removeBehavior(id);
      fetchData();
    }
  };

  const exportCSV = () => {
    const headers = ["Student Name", "Date", "Type", "Content", "Points"];
    const rows = filteredBehaviors.map(b => [
      students.find(s => s.id === b.studentId)?.fullName || 'N/A',
      b.date,
      b.type,
      b.content.replace(/,/g, " "),
      b.points
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `behavior_${selectedClassId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter behaviors by class students
  const studentIdsInClass = students.map(s => s.id);
  const filteredBehaviors = behaviors.filter(b => 
    studentIdsInClass.includes(b.studentId) && 
    (students.find(s => s.id === b.studentId)?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     b.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Nề nếp / Hành vi</h2>
          <p className="text-sm text-gray-500">Ghi nhận khen thưởng và nhắc nhở học sinh</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportCSV}
            className="bg-white text-gray-700 border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <FileDown size={18}/>
            <span>Xuất CSV</span>
          </button>
          <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <Plus size={18}/>
            <span>Ghi nhận mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 w-full sm:max-w-xs">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Tìm theo tên học sinh, nội dung..." className="outline-none text-sm w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-gray-400" />
            <select className="border rounded-lg px-3 py-2 text-sm outline-none bg-white" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
               {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.className}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Học sinh</th>
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4">Điểm</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBehaviors.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Chưa có ghi nhận nề nếp nào trong lớp này</td>
                </tr>
              ) : (
                filteredBehaviors.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {students.find(s => s.id === b.studentId)?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{b.date}</td>
                    <td className="px-6 py-4">
                      {b.type === 'PRAISE' ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
                          <Star size={12} fill="currentColor"/> Khen ngợi
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase">
                          <AlertTriangle size={12} fill="currentColor"/> Nhắc nhở
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={b.content}>{b.content}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${b.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {b.points > 0 ? `+${b.points}` : b.points}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenModal(b)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(b.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg">{editingItem ? 'Sửa ghi nhận' : 'Ghi nhận nề nếp mới'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Học sinh</label>
                  <select required className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                     {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại</label>
                    <select className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any, points: e.target.value === 'PRAISE' ? 5 : -2})}>
                       <option value="PRAISE">Khen ngợi (+)</option>
                       <option value="WARN">Nhắc nhở (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số điểm</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.points} onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày ghi nhận</label>
                  <input required type="date" className="w-full border rounded-lg px-3 py-2 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nội dung chi tiết</label>
                  <textarea required className="w-full border rounded-lg px-3 py-2 outline-none" rows={3} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Vd: Phát biểu bài tích cực..."></textarea>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Lưu ghi nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviorPage;
