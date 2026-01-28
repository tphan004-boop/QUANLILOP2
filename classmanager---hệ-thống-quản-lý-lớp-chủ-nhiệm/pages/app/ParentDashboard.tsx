
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Announcement, Student, Task, ClassInfo } from '../../core/types';
import { Bell, FileCheck, Info, Star, School } from 'lucide-react';

const ParentDashboard: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [child, setChild] = useState<Student | null>(null);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const students = await provider.getStudents();
      const firstChild = students[0]; 
      if (firstChild) {
        setChild(firstChild);
        const [anns, tks, cls] = await Promise.all([
          provider.getAnnouncements(firstChild.classId),
          provider.getTasks(firstChild.classId),
          provider.getClassById(firstChild.classId)
        ]);
        setAnnouncements(anns);
        setTasks(tks);
        setClassInfo(cls || null);
      }
    };
    loadData();
  }, []);

  if (!child) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
       <Info size={48} className="text-gray-200 mb-4"/>
       <h3 className="text-xl font-bold text-gray-900">Không tìm thấy dữ liệu học sinh</h3>
       <p className="text-sm text-gray-500">Vui lòng liên hệ nhà trường để cập nhật thông tin học sinh liên kết với tài khoản này.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Cổng thông tin phụ huynh</h2>
          <p className="text-gray-500 font-medium">Xin chào phụ huynh em <span className="text-indigo-600 font-black">{child.fullName}</span></p>
        </div>
        <div className="bg-indigo-600 text-white px-8 py-4 rounded-3xl flex items-center gap-4 shadow-xl shadow-indigo-100">
           <div className="p-2 bg-white/20 rounded-xl"><Star size={24} fill="currentColor"/></div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Điểm rèn luyện</p>
              <p className="text-2xl font-black">{child.behaviorScore} điểm</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Announcements & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3 text-indigo-600">
                 <Bell size={24} className="animate-bounce" />
                 <h3 className="font-black text-xl">Thông báo mới nhất</h3>
               </div>
               <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase">{announcements.length} tin mới</span>
             </div>
             <div className="space-y-6">
                {announcements.slice(0, 3).map(a => (
                  <div key={a.id} className="group relative border-l-4 border-indigo-500 pl-6 py-2 hover:bg-indigo-50/30 transition-all rounded-r-2xl">
                    <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{a.title}</h4>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{a.content}</p>
                    <p className="text-[10px] text-gray-400 mt-3 uppercase font-black tracking-widest flex items-center gap-2">
                       <span>{new Date(a.createdAt).toLocaleDateString('vi-VN')}</span>
                       <span className="text-gray-200">|</span>
                       <span>Từ: {a.author}</span>
                    </p>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-center py-10 text-gray-400 italic">Chưa có thông báo nào mới</p>}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex items-center gap-3 mb-8 text-indigo-600">
               <FileCheck size={24}/>
               <h3 className="font-black text-xl">Bài tập & Nhiệm vụ</h3>
             </div>
             <div className="divide-y divide-gray-100">
                {tasks.slice(0, 5).map(t => (
                  <div key={t.id} className="py-5 flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{t.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Hạn chót: {new Date(t.dueDate).toLocaleString('vi-VN')}</p>
                         {new Date(t.dueDate) < new Date() && <span className="bg-red-50 text-red-500 text-[9px] px-1.5 rounded font-black uppercase">Quá hạn</span>}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-50 text-indigo-600 rounded-xl font-black text-xs hover:bg-indigo-600 hover:text-white transition shadow-sm">Chi tiết</button>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-center py-10 text-gray-400 italic">Chưa có nhiệm vụ nào được giao</p>}
             </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
             <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <School size={18} className="text-indigo-600"/> Thông tin học sinh
             </h3>
             <div className="space-y-4 text-sm relative z-10">
                <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mã định danh</span>
                  <span className="font-black text-indigo-900">{child.id}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lớp học</span>
                  <span className="font-black text-indigo-600 text-lg">Lớp {classInfo?.className || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Năm học</span>
                  <span className="font-black text-gray-700">{classInfo?.schoolYear || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-green-50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Chuyên cần</span>
                  <span className="font-black text-green-700">95%</span>
                </div>
             </div>
          </div>

          <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-dashed border-indigo-100 flex items-start gap-4">
             <Info className="text-indigo-600 shrink-0 mt-1" size={24}/>
             <div>
               <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                 "Lưu ý từ Giáo viên: Phụ huynh vui lòng theo dõi lịch kiểm tra định kỳ trong mục Thông báo để đôn đốc con học bài."
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
