
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Student, ClassInfo } from '../../core/types';
import { 
  Search, Edit2, Trash2, X, Save, Filter, 
  Upload, UserPlus, Users, BookOpen, Phone, Calendar, Hash, FileText, User, 
  MapPin, CheckCircle2, AlertCircle, ArrowRightLeft, ArrowRight, Info, ChevronRight
} from 'lucide-react';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  // Form States
  const [editingItem, setEditingItem] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'behaviorScore'>>({
    classId: '', fullName: '', dob: '', gender: 'Nam', address: '', parentId: '', status: 'Đang học',
    ethnicity: 'Kinh', parentName: '', phoneNumber: '', familyBackground: 'Bình thường', 
    registryNumber: '', investigationNumber: ''
  });

  // Bulk Import States
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Omit<Student, 'id' | 'behaviorScore'>[]>([]);

  const fetchData = async () => {
    const [st, cl] = await Promise.all([
      provider.getStudents(selectedClassId || undefined),
      provider.getClasses()
    ]);
    setStudents(st);
    setClasses(cl);
    if (cl.length > 0 && !selectedClassId && !formData.classId) {
      setFormData(prev => ({ ...prev, classId: cl[0].id }));
    }
  };

  useEffect(() => { fetchData(); }, [selectedClassId]);

  useEffect(() => {
    if (!bulkText.trim()) {
      setBulkPreview([]);
      return;
    }
    const lines = bulkText.split('\n').filter(l => l.trim() !== '');
    const currentClassId = selectedClassId || (classes[0]?.id || '');
    
    const preview = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        classId: currentClassId,
        fullName: parts[0] || 'Chưa rõ tên',
        dob: parts[1] || '2010-01-01',
        gender: (parts[2] === 'Nữ' ? 'Nữ' : 'Nam') as 'Nam' | 'Nữ',
        ethnicity: parts[3] || 'Kinh',
        parentName: parts[4] || '',
        phoneNumber: parts[5] || '',
        address: parts[6] || '',
        registryNumber: parts[7] || '',
        investigationNumber: parts[8] || '',
        familyBackground: parts[9] || 'Bình thường',
        parentId: '',
        status: 'Đang học' as const
      };
    });
    setBulkPreview(preview);
  }, [bulkText, selectedClassId, classes]);

  const handleOpenModal = (item?: Student) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        classId: item.classId,
        fullName: item.fullName,
        dob: item.dob,
        gender: item.gender,
        address: item.address,
        parentId: item.parentId,
        status: item.status,
        ethnicity: item.ethnicity || 'Kinh',
        parentName: item.parentName || '',
        phoneNumber: item.phoneNumber || '',
        familyBackground: item.familyBackground || 'Bình thường',
        registryNumber: item.registryNumber || '',
        investigationNumber: item.investigationNumber || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        classId: selectedClassId || (classes[0]?.id || ''), 
        fullName: '', dob: '', gender: 'Nam', address: '', parentId: '', status: 'Đang học',
        ethnicity: 'Kinh', parentName: '', phoneNumber: '', familyBackground: 'Bình thường',
        registryNumber: '', investigationNumber: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await provider.updateStudent(editingItem.id, formData);
    } else {
      await provider.addStudent(formData);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleBulkSubmit = async () => {
    if (bulkPreview.length === 0) return;
    try {
      await provider.addStudents(bulkPreview);
      setIsBulkModalOpen(false);
      setBulkText('');
      setBulkPreview([]);
      fetchData();
      alert(`Đã nhập thành công ${bulkPreview.length} học sinh!`);
    } catch (err) {
      alert('Có lỗi xảy ra khi nhập dữ liệu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hành động này sẽ xóa vĩnh viễn hồ sơ học sinh. Bạn chắc chắn chứ?')) {
      await provider.removeStudent(id);
      fetchData();
    }
  };

  const getStatusBadge = (status: Student['status']) => {
    switch (status) {
      case 'Đang học':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-green-50 text-green-600 border border-green-100"><CheckCircle2 size={12}/> Đang học</span>;
      case 'Nghỉ học':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100"><AlertCircle size={12}/> Nghỉ học</span>;
      case 'Chuyển trường':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-100"><ArrowRightLeft size={12}/> Chuyển</span>;
      default:
        return status;
    }
  };

  const filtered = students.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registryNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.investigationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
             <Users size={28}/>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Học sinh</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
               Cổng giáo viên <ArrowRight size={12}/> Sổ bộ & Điều tra
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => setIsBulkModalOpen(true)} className="flex-1 md:flex-none bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black hover:bg-indigo-100 transition">
            <Upload size={18}/> <span>Nhập Excel</span>
          </button>
          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
            <UserPlus size={18}/> <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-6 border-b bg-gray-50/50 flex flex-col lg:flex-row items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3 w-full lg:max-w-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <Search size={20} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo Mã HS, Tên, SĐB, PĐT, SĐT, Cha/Mẹ..." 
              className="outline-none text-sm w-full bg-transparent font-bold text-gray-700 placeholder-gray-400" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto ml-auto">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm shrink-0">
              <Filter size={18} className="text-gray-400" />
              <select className="outline-none text-sm font-black bg-transparent text-gray-700" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                 <option value="">Tất cả lớp</option>
                 {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.className}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white text-gray-400 uppercase text-[10px] font-black tracking-[0.15em] border-b">
              <tr>
                <th className="px-8 py-6">Mã & Học sinh</th>
                <th className="px-6 py-6 text-center">Năm sinh & Phái</th>
                <th className="px-6 py-6 text-center">Trạng thái</th>
                <th className="px-6 py-6">Hồ sơ (SĐB / PĐT)</th>
                <th className="px-6 py-6">Cha (Mẹ) & SĐT</th>
                <th className="px-6 py-6">Nơi ở hiện tại</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-indigo-50/20 transition-all group">
                  {/* Mã & Học sinh */}
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-tighter mb-1">#{s.id.split('-').pop()}</span>
                       <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0 ${s.gender === 'Nữ' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                            {s.fullName.split(' ').pop()?.charAt(0)}
                         </div>
                         <p className="font-black text-gray-900 text-sm leading-tight">{s.fullName}</p>
                       </div>
                    </div>
                  </td>

                  {/* Năm sinh & Giới tính */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-1.5">
                       <span className="flex items-center gap-1.5 text-gray-700 font-bold text-xs bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          <Calendar size={12} className="text-indigo-400"/> {s.dob}
                       </span>
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter ${
                         s.gender === 'Nữ' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                       }`}>
                         {s.gender}
                       </span>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="px-6 py-5 text-center">
                    {getStatusBadge(s.status)}
                  </td>

                  {/* Hồ sơ Sổ bộ & Phiếu điều tra */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-gray-400"><FileText size={10}/></div>
                        <span className="text-[9px] font-black text-gray-400 uppercase w-10">Sổ bộ:</span>
                        <span className="font-mono text-xs font-black text-gray-700">{s.registryNumber || '---'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center text-indigo-400"><Hash size={10}/></div>
                        <span className="text-[9px] font-black text-gray-400 uppercase w-10">Phiếu:</span>
                        <span className="font-mono text-xs font-black text-indigo-600">{s.investigationNumber || '---'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Cha (Mẹ) & SĐT */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-gray-400"/>
                        <span className="font-bold text-gray-800 text-xs">{s.parentName || '---'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-green-500"/>
                        <span className="font-black text-gray-500 text-[11px] tracking-tight">{s.phoneNumber || '---'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Nơi ở */}
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-2 max-w-[180px]">
                      <MapPin size={14} className="text-rose-400 mt-0.5 shrink-0"/>
                      <span className="text-[11px] font-bold text-gray-500 leading-snug" title={s.address}>
                        {s.address || 'Chưa cập nhật nơi ở'}
                      </span>
                    </div>
                  </td>

                  {/* Thao tác */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => handleOpenModal(s)} className="p-2.5 text-indigo-600 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-indigo-100">
                        <Edit2 size={18}/>
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-rose-100">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300 italic">
                       <Users size={64} className="mb-4 text-gray-100"/>
                       <p className="text-lg font-bold">Không tìm thấy dữ liệu học sinh</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Thêm / Sửa học sinh */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto animate-in zoom-in duration-300">
            <form onSubmit={handleSubmit}>
              <div className="px-10 py-8 border-b flex justify-between items-center bg-gray-50/50 rounded-t-[2.5rem]">
                <div>
                  <h3 className="font-black text-2xl text-gray-900">{editingItem ? 'Sửa hồ sơ học sinh' : 'Thêm học sinh mới'}</h3>
                  <p className="text-xs text-indigo-500 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                     <ArrowRight size={12}/> {editingItem ? `Mã HS: #${editingItem.id}` : 'Vui lòng điền đủ các trường hành chính'}
                  </p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-200 rounded-2xl transition text-gray-400">
                  <X size={28}/>
                </button>
              </div>
              
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Phần 1: Nhân thân & Thông tin cá nhân */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b-2 border-indigo-50 pb-3">
                     <User size={14}/> Nhân thân & Cá nhân
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Họ và tên học sinh</label>
                    <input required type="text" className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black transition-all bg-gray-50/30" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Vd: Nguyễn Văn An"/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Giới tính</label>
                      <select className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black bg-gray-50/30" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                         <option value="Nam">Nam</option>
                         <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Trạng thái học</label>
                      <select className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black bg-gray-50/30" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                         <option value="Đang học">Đang học</option>
                         <option value="Nghỉ học">Nghỉ học</option>
                         <option value="Chuyển trường">Chuyển trường</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ngày sinh</label>
                      <input required type="date" className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black bg-gray-50/30" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dân tộc</label>
                      <input type="text" className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black bg-gray-50/30" value={formData.ethnicity} onChange={e => setFormData({...formData, ethnicity: e.target.value})} placeholder="Kinh"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nơi cư trú hiện tại (Địa chỉ)</label>
                    <textarea required className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-indigo-600 font-black bg-gray-50/30 h-24 resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Số nhà, Đường, Thôn/Xóm..."/>
                  </div>
                </div>

                {/* Phần 2: Gia đình & Hồ sơ hành chính */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b-2 border-indigo-50 pb-3">
                     <BookOpen size={14}/> Gia đình & Hồ sơ
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Họ tên Cha (Mẹ) / Người giám hộ</label>
                    <input type="text" className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black bg-gray-50/30" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} placeholder="Họ tên người liên hệ chính"/>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Số điện thoại liên lạc</label>
                    <input required type="tel" className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black bg-gray-50/30" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="Vd: 0912345678"/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Số đăng bộ</label>
                      <input type="text" className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black bg-gray-50/30" value={formData.registryNumber} onChange={e => setFormData({...formData, registryNumber: e.target.value})} placeholder="SDB-XXXX"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phiếu điều tra</label>
                      <input type="text" className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-600 font-black bg-gray-50/30" value={formData.investigationNumber} onChange={e => setFormData({...formData, investigationNumber: e.target.value})} placeholder="PĐT-XXXX"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hoàn cảnh gia đình / Ghi chú</label>
                    <textarea className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-indigo-600 font-black bg-gray-50/30 h-[92px] resize-none" value={formData.familyBackground} onChange={e => setFormData({...formData, familyBackground: e.target.value})} placeholder="Hộ nghèo, mồ côi, bệnh tật..."/>
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 border-t flex justify-end gap-4 bg-gray-50/50 rounded-b-[2.5rem]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 text-sm font-black text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-widest">Hủy bỏ</button>
                <button type="submit" className="px-12 py-3.5 bg-indigo-600 text-white rounded-[1.25rem] font-black flex items-center gap-2 hover:bg-indigo-700 transition shadow-2xl shadow-indigo-200">
                  <Save size={20}/>
                  <span>Lưu hồ sơ chi tiết</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl my-auto animate-in slide-in-from-bottom-8 duration-500">
            <div className="px-10 py-8 border-b flex justify-between items-center bg-gray-50 rounded-t-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-[1.25rem] shadow-sm"><Upload size={24}/></div>
                <div>
                  <h3 className="font-black text-2xl text-gray-900">Nhập danh sách hàng loạt</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Họ tên, Ngày sinh, Phái, Cha/Mẹ, SĐT, Nơi ở...</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsBulkModalOpen(false)} className="p-3 hover:bg-gray-200 rounded-2xl transition text-gray-400"><X size={28}/></button>
            </div>
            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <div className="bg-indigo-50/50 p-6 rounded-[1.5rem] border border-indigo-100">
                    <h5 className="text-[11px] font-black text-indigo-900 mb-2 uppercase tracking-widest">Cấu trúc dòng dữ liệu (cách nhau dấu phẩy):</h5>
                    <p className="text-[10px] text-indigo-700 leading-relaxed font-bold">
                       1. Họ tên | 2. Ngày sinh (YYYY-MM-DD) | 3. Giới tính | 4. Dân tộc | 5. Cha/Mẹ | 6. SĐT | 7. Nơi ở | 8. Sổ bộ | 9. Phiếu ĐT | 10. Hoàn cảnh
                    </p>
                 </div>
                <textarea 
                  required 
                  className="w-full border-2 border-gray-100 rounded-[1.5rem] p-6 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none h-80 bg-gray-50/30 font-medium"
                  placeholder="Vd: Nguyễn Văn An, 2010-05-20, Nam, Kinh, Nguyễn Văn B, 0901234567, Hà Nội, SDB-001, PĐT-001, Bình thường"
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex flex-col">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <ChevronRight size={14} className="text-indigo-500"/> Xem trước bản ghi ({bulkPreview.length})
                </h4>
                <div className="flex-1 border-2 border-gray-50 rounded-[1.5rem] overflow-hidden bg-gray-50/20 overflow-y-auto max-h-[460px]">
                  {bulkPreview.length > 0 ? (
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead className="bg-white sticky top-0 font-black text-gray-400 uppercase tracking-tighter border-b">
                        <tr><th className="p-4">Học sinh</th><th className="p-4">Phái</th><th className="p-4">Cha/Mẹ</th><th className="p-4">Sổ bộ</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bulkPreview.map((p, i) => (
                          <tr key={i} className="hover:bg-white transition-colors">
                            <td className="p-4 font-black text-gray-700">{p.fullName}</td>
                            <td className="p-4 text-gray-500">{p.gender}</td>
                            <td className="p-4 text-indigo-600 font-bold">{p.parentName}</td>
                            <td className="p-4 text-gray-500 font-mono">{p.registryNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 p-10 text-center italic">
                      <p className="text-sm font-bold opacity-50">Dán nội dung từ Excel vào ó bên trái</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-10 py-8 border-t flex justify-end gap-4 bg-gray-50 rounded-b-[2.5rem]">
              <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-8 py-3 text-sm font-black text-gray-400 uppercase tracking-widest">Đóng</button>
              <button disabled={bulkPreview.length === 0} onClick={handleBulkSubmit} className="px-12 py-3.5 bg-indigo-600 text-white rounded-[1.25rem] font-black flex items-center gap-2 hover:bg-indigo-700 transition shadow-2xl disabled:opacity-30">
                <Save size={20}/>
                <span>Lưu tất cả ({bulkPreview.length}) học sinh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
