
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Announcement, Student } from '../../core/types';
import { Bell, Pin, Calendar, User } from 'lucide-react';

const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [child, setChild] = useState<Student | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const students = await provider.getStudents();
      const firstChild = students[0]; // Mock
      if (firstChild) {
        setChild(firstChild);
        const data = await provider.getAnnouncements(firstChild.classId);
        // Filter by target audience (parent/student/all)
        // For simplicity, we show everything relevant to this class
        setAnnouncements(data);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Thông báo từ nhà trường & GV</h2>
        <p className="text-gray-500">Cập nhật tin tức quan trọng dành cho lớp {child?.classId === 'c1' ? '12A1' : 'Hệ thống'}</p>
      </div>

      <div className="space-y-4">
        {announcements.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl shadow-sm border ${item.pinned ? 'border-indigo-100' : 'border-gray-100'} overflow-hidden transition hover:shadow-md`}>
            {item.pinned && (
              <div className="bg-indigo-50 px-4 py-1.5 flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                <Pin size={12} fill="currentColor"/> Thông báo quan trọng đã ghim
              </div>
            )}
            <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={12}/> {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <User size={12}/> {item.author}
                       </div>
                    </div>
                 </div>
               </div>
               <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.content}
               </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 text-gray-400 italic">
            Hiện chưa có thông báo mới nào
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsView;
