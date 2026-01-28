
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { ClassInfo, Student } from '../../core/types';
import { School, Target, Users, Phone, Edit3, Save, Info } from 'lucide-react';

const ClassInfoPage: React.FC = () => {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [isEditingPH, setIsEditingPH] = useState(false);
  const [tempPHInfo, setTempPHInfo] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const students = await provider.getStudents();
      const firstChild = students[0]; // Giả định là con của user hiện tại
      if (firstChild) {
        const cls = await provider.getClassById(firstChild.classId);
        if (cls) {
          setClassInfo(cls);
          setTempPHInfo(cls.parentCouncil || '');
        }
      }
    };
    loadData();
  }, []);

  const handleUpdateCouncil = async () => {
    if (classInfo) {
      const updated = await provider.updateClass(classInfo.id, { parentCouncil: tempPHInfo });
      setClassInfo(updated);
      setIsEditingPH(false);
      alert('Đã cập nhật thông tin Ban đại diện!');
    }
  };

  if (!classInfo) return <div className="p-8 text-center text-gray-400 italic">Đang tải hồ sơ lớp học...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mái nhà chung {classInfo.className}</h2>
          <p className="text-gray-500 italic">"{classInfo.classSlogan || 'Đoàn kết là sức mạnh'}"</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 flex items-center gap-2">
           <School size={16} className="text-indigo-600"/>
           <span className="text-sm font-bold text-indigo-700">Niên khóa: {classInfo.schoolYear}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Info for Parents */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Target size={20} className="text-indigo-600"/> Định hướng học tập
             </h3>
             <div className="bg-indigo-50/50 p-6 rounded-2xl text-gray-700 text-sm leading-relaxed border border-indigo-50">
                {classInfo.goals || 'Chưa có thông tin mục tiêu học tập cụ thể từ Giáo viên.'}
             </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <Phone size={24}/>
                </div>
                <div>
                   <h3 className="font-bold">Liên hệ Giáo viên</h3>
                   <p className="text-xs text-indigo-100 opacity-80">Thông tin liên lạc của Thầy/Cô chủ nhiệm</p>
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-3">
                   <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Họ và tên</span>
                   <span className="font-bold">{classInfo.homeroomTeacher}</span>
                </div>
                <div className="pt-2">
                   <p className="text-sm text-indigo-50 whitespace-pre-wrap leading-relaxed">{classInfo.contactInfo || 'Thông tin liên hệ chưa cập nhật.'}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Parent Council (Editable by Parents in this mock) */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                 <Users size={20} className="text-indigo-600"/> Ban đại diện CMHS
              </h3>
              {!isEditingPH ? (
                <button onClick={() => setIsEditingPH(true)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Cập nhật thông tin Ban đại diện">
                   <Edit3 size={18}/>
                </button>
              ) : (
                <button onClick={handleUpdateCouncil} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1">
                   <Save size={14}/> Lưu
                </button>
              )}
           </div>

           <div className="flex-1 flex flex-col">
              <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-[10px] font-bold mb-6 flex items-start gap-2">
                 <Info size={14} className="shrink-0"/>
                 PHỤ HUYNH CÓ THỂ TỰ CẬP NHẬT THÀNH VIÊN BAN ĐẠI DIỆN ĐỂ CẢ LỚP CÙNG NẮM BẮT THÔNG TIN.
              </div>

              {isEditingPH ? (
                <textarea 
                  className="w-full flex-1 border border-indigo-200 rounded-2xl p-4 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={tempPHInfo}
                  onChange={e => setTempPHInfo(e.target.value)}
                  placeholder="Vd: &#10;Trưởng ban: Anh Bình (090...) &#10;Thủ quỹ: Chị Lan (091...)"
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm text-gray-600 leading-loose italic bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200 flex-1">
                   {classInfo.parentCouncil || 'Chưa có thông tin ban đại diện. Phụ huynh vui lòng cập nhật tại đây.'}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClassInfoPage;
