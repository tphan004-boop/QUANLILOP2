
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Student, Behavior } from '../../core/types';
import { Star, AlertTriangle, Calendar, Award, MessageCircle } from 'lucide-react';

const BehaviorHistory: React.FC = () => {
  const [child, setChild] = useState<Student | null>(null);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const students = await provider.getStudents();
      const firstChild = students[0]; 
      if (firstChild) {
        setChild(firstChild);
        const data = await provider.getBehaviors(firstChild.id);
        setBehaviors(data.sort((a, b) => b.date.localeCompare(a.date)));
      }
    };
    loadData();
  }, []);

  const praiseRecords = behaviors.filter(b => b.type === 'PRAISE');
  const warnRecords = behaviors.filter(b => b.type === 'WARN');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lịch sử Nề nếp / Rèn luyện</h2>
          <p className="text-gray-500">Theo dõi điểm rèn luyện và ghi nhận của {child?.fullName}</p>
        </div>
        <div className="bg-indigo-600 text-white p-4 rounded-2xl text-center shadow-lg">
           <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Tổng điểm rèn luyện</p>
           <p className="text-3xl font-black">{child?.behaviorScore}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md shadow-green-200">
              <Award size={24}/>
           </div>
           <div>
              <p className="text-sm text-green-700 font-medium">Số lần tuyên dương</p>
              <p className="text-2xl font-bold text-green-900">{praiseRecords.length}</p>
           </div>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md shadow-orange-200">
              <AlertTriangle size={24}/>
           </div>
           <div>
              <p className="text-sm text-orange-700 font-medium">Số lần nhắc nhở</p>
              <p className="text-2xl font-bold text-orange-900">{warnRecords.length}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
           <h3 className="font-bold flex items-center gap-2">
             <MessageCircle size={18} className="text-indigo-600"/>
             Dòng thời gian rèn luyện
           </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {behaviors.length === 0 ? (
            <div className="p-12 text-center text-gray-400 italic">Chưa có ghi nhận rèn luyện nào</div>
          ) : (
            behaviors.map(b => (
              <div key={b.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between">
                   <div className="flex gap-4">
                      <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${b.type === 'PRAISE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         {b.type === 'PRAISE' ? <Star size={16} fill="currentColor"/> : <AlertTriangle size={16} fill="currentColor"/>}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{b.type === 'PRAISE' ? 'Khen ngợi / Tuyên dương' : 'Nhắc nhở / Rèn luyện'}</h4>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{b.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                           <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                             <Calendar size={12}/> {b.date}
                           </span>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-black ${b.points >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {b.points > 0 ? `+${b.points}` : b.points} ĐIỂM
                           </span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BehaviorHistory;
