
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { ClassInfo } from '../../core/types';
import { School, Target, Phone, Users, Save, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClassProfilePage: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ClassInfo>>({});
  const navigate = useNavigate();

  const loadClasses = () => {
    provider.getClasses().then(data => {
      setClasses(data);
      if (data.length > 0) {
        if (!selectedClass || !data.find(c => c.id === selectedClass.id)) {
          setSelectedClass(data[0]);
          setFormData(data[0]);
        }
      } else {
        setSelectedClass(null);
      }
    });
  };

  useEffect(() => { loadClasses(); }, []);

  const handleSelectClass = (id: string) => {
    const cls = classes.find(c => c.id === id) || null;
    setSelectedClass(cls);
    setFormData(cls || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (selectedClass) {
      const updated = await provider.updateClass(selectedClass.id, formData);
      setSelectedClass(updated);
      setIsEditing(false);
      alert('Đã cập nhật thông tin lớp học!');
      loadClasses();
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    if (confirm(`Bạn có chắc chắn muốn XÓA lớp ${selectedClass.className} không? Tất cả dữ liệu học sinh, điểm danh, nề nếp của lớp này cũng sẽ bị xóa vĩnh viễn.`)) {
      await provider.removeClass(selectedClass.id);
      setSelectedClass(null);
      loadClasses();
      alert('Đã xóa lớp học thành công.');
    }
  };

  if (!selectedClass) return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
       <School size={64} className="text-gray-200" />
       <div className="space-y-2">
         <h3 className="text-xl font-black text-gray-900">Chưa có hồ sơ lớp học nào</h3>
         <p className="text-sm text-gray-500 max-w-xs mx-auto">Vui lòng truy cập trang 'Quản lý lớp' để thêm lớp học mới vào hệ thống.</p>
       </div>
       <button 
         onClick={() => navigate('/admin/classes')}
         className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100"
       >
         Đến trang Quản lý lớp
       </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Hồ sơ Lớp học</h2>
          <p className="text-sm text-gray-500 font-medium">Thông tin chi tiết và định hướng cho lớp chủ nhiệm</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select 
            className="flex-1 md:flex-none border-2 border-gray-100 rounded-xl px-4 py-2 text-sm bg-white font-bold outline-none focus:border-indigo-600"
            value={selectedClass.id}
            onChange={(e) => handleSelectClass(e.target.value)}
          >
            {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.className}</option>)}
          </select>
          {isEditing ? (
            <button onClick={handleSave} className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2 rounded-xl flex items-center justify-center gap-2 font-black hover:bg-green-700 shadow-lg transition">
              <Save size={18}/> Lưu hồ sơ
            </button>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-2 rounded-xl font-black hover:bg-indigo-700 shadow-lg transition">
                Chỉnh sửa
              </button>
              <button onClick={handleDeleteClass} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition shadow-sm border border-red-100" title="Xóa hồ sơ lớp này">
                <Trash2 size={20}/>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 opacity-50"></div>
             <div className="flex items-center gap-5 mb-10 relative z-10">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-100">
                   <School size={40}/>
                </div>
                <div>
                   <h3 className="text-4xl font-black text-gray-900">Lớp {selectedClass.className}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Năm học: {selectedClass.schoolYear}</span>
                   </div>
                </div>
             </div>

             <div className="space-y-8 relative z-10">
                <div>
                   <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Sparkles size={14}/> Khẩu hiệu lớp học (Slogan)
                   </label>
                   {isEditing ? (
                     <input className="w-full border-b-4 border-indigo-50 focus:border-indigo-600 outline-none py-3 text-2xl font-black text-indigo-900 bg-transparent transition-all" value={formData.classSlogan || ''} onChange={e => setFormData({...formData, classSlogan: e.target.value})} placeholder="Vd: Học hết mình, chơi nhiệt tình..."/>
                   ) : (
                     <p className="text-3xl font-black text-gray-800 italic leading-tight">"{selectedClass.classSlogan || 'Chưa thiết lập khẩu hiệu'}"</p>
                   )}
                </div>

                <div>
                   <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Target size={14}/> Mục tiêu & Phương hướng học tập
                   </label>
                   {isEditing ? (
                     <textarea className="w-full border-2 border-gray-100 rounded-3xl p-6 text-sm bg-gray-50 focus:border-indigo-600 outline-none font-bold" rows={5} value={formData.goals || ''} onChange={e => setFormData({...formData, goals: e.target.value})} placeholder="Nhập mục tiêu cụ thể của lớp..."/>
                   ) : (
                     <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                        <p className="text-gray-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">{selectedClass.goals || 'Chưa có thông tin mục tiêu học tập.'}</p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h3 className="font-black text-xl mb-6 flex items-center gap-3">
                <Users size={24} className="text-indigo-600"/> Ban đại diện Cha mẹ học sinh
             </h3>
             {isEditing ? (
                <textarea className="w-full border-2 border-gray-100 rounded-3xl p-6 text-sm bg-gray-50 outline-none font-bold" rows={4} value={formData.parentCouncil || ''} onChange={e => setFormData({...formData, parentCouncil: e.target.value})} placeholder="Vd: &#10;Trưởng ban: Ông Trần Văn A (090...) &#10;Phó ban: Bà Lê Thị B (091...)"/>
             ) : (
                <div className="bg-indigo-50/30 p-8 rounded-3xl border-2 border-dashed border-indigo-100">
                   <p className="text-sm text-gray-600 font-bold whitespace-pre-wrap leading-loose italic">
                      {selectedClass.parentCouncil || 'Thông tin Ban đại diện CMHS chưa được cập nhật.'}
                   </p>
                </div>
             )}
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="space-y-6">
          <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200">
             <h3 className="font-black text-xl mb-8 flex items-center gap-3">
                <Phone size={24} className="text-indigo-300"/> Liên hệ Giáo viên
             </h3>
             <div className="space-y-8">
                <div>
                   <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 opacity-60">Giáo viên chủ nhiệm</p>
                   <p className="text-2xl font-black tracking-tight">{selectedClass.homeroomTeacher}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 opacity-60">Kênh liên lạc chính thức</p>
                   {isEditing ? (
                      <textarea className="w-full bg-white/10 border-2 border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-white/30" rows={3} value={formData.contactInfo || ''} onChange={e => setFormData({...formData, contactInfo: e.target.value})} placeholder="SĐT, Email, Zalo..."/>
                   ) : (
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                        <p className="text-sm text-indigo-100 font-bold whitespace-pre-wrap leading-relaxed">{selectedClass.contactInfo || 'Chưa cập nhật SĐT/Email liên hệ.'}</p>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={18} className="text-gray-400"/>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Ghi chú quản lý</h4>
             </div>
             {isEditing ? (
                <textarea className="w-full border-2 border-gray-100 rounded-2xl p-4 text-xs font-bold bg-gray-50 outline-none" rows={4} value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Ghi chú nội bộ dành cho lớp..."/>
             ) : (
                <p className="text-xs text-gray-500 font-bold italic leading-relaxed">{selectedClass.note || 'Không có ghi chú thêm cho hồ sơ này.'}</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassProfilePage;
