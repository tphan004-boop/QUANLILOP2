
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { WeeklyReportData, MonthlyReportData } from '../../core/dataProvider';
import { ClassInfo } from '../../core/types';
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, Clock, Star, AlertTriangle, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [weeklyData, setWeeklyData] = useState<WeeklyReportData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    now.setDate(now.getDate() - day + 1);
    return now.toISOString().split('T')[0];
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    provider.getClasses().then(cls => {
      setClasses(cls);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);
    if (activeTab === 'weekly') {
      provider.reportsWeekly(selectedClassId, weekStart).then(data => {
        setWeeklyData(data);
        setLoading(false);
      });
    } else {
      provider.reportsMonthly(selectedClassId, selectedMonth).then(data => {
        setMonthlyData(data);
        setLoading(false);
      });
    }
  }, [selectedClassId, weekStart, selectedMonth, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Báo cáo & Tổng kết</h2>
          <p className="text-sm text-gray-500">Phân tích dữ liệu học sinh định kỳ</p>
        </div>
        <div className="flex items-center gap-3">
           <select 
             className="border rounded-lg px-4 py-2 text-sm outline-none bg-white font-medium" 
             value={selectedClassId} 
             onChange={e => setSelectedClassId(e.target.value)}
           >
             {classes.map(c => <option key={c.id} value={c.id}>Lớp {c.className}</option>)}
           </select>
        </div>
      </div>

      <div className="bg-white p-1 rounded-xl border border-gray-200 inline-flex shadow-sm">
         <button 
           onClick={() => setActiveTab('weekly')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'weekly' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
         >
           Tổng kết Tuần
         </button>
         <button 
           onClick={() => setActiveTab('monthly')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
         >
           Tổng kết Tháng
         </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
         {activeTab === 'weekly' ? (
           <>
             <Calendar size={18} className="text-indigo-600"/>
             <span className="text-sm font-medium">Chọn tuần bắt đầu từ:</span>
             <input 
               type="date" 
               className="border-none outline-none text-sm font-bold text-indigo-600" 
               value={weekStart} 
               onChange={e => setWeekStart(e.target.value)}
             />
           </>
         ) : (
           <>
             <Calendar size={18} className="text-indigo-600"/>
             <span className="text-sm font-medium">Chọn tháng tổng kết:</span>
             <input 
               type="month" 
               className="border-none outline-none text-sm font-bold text-indigo-600" 
               value={selectedMonth} 
               onChange={e => setSelectedMonth(e.target.value)}
             />
           </>
         )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 italic">Đang phân tích dữ liệu...</div>
      ) : activeTab === 'weekly' && weeklyData ? (
        <div className="space-y-6 animate-in fade-in duration-500">
           {/* Weekly Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Chuyên cần</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-black text-indigo-600">{weeklyData.attendanceRate.toFixed(1)}%</h3>
                    <TrendingUp size={20} className="text-green-500 mb-1"/>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vắng / Trễ</p>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-red-500"></div>
                       <span className="text-2xl font-black text-gray-900">{weeklyData.absentCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                       <span className="text-2xl font-black text-gray-900">{weeklyData.lateCount}</span>
                    </div>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Task quá hạn</p>
                 <h3 className="text-3xl font-black text-red-500">{weeklyData.overdueTasksCount}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">PH phản hồi</p>
                 <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-green-600">{weeklyData.repliedParentsCount}</h3>
                    <span className="text-gray-400 font-bold text-sm">/ {weeklyData.totalStudents}</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                       <FileText size={20} className="text-indigo-600"/> Tóm tắt tuần
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm bg-indigo-50/50 p-4 rounded-xl italic">
                       "{weeklyData.summary}"
                    </p>
                 </div>
                 <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Top rèn luyện trong tuần</h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-[10px] font-bold text-green-600 uppercase mb-4 flex items-center gap-1">
                             <Star size={14} fill="currentColor"/> Tuyên dương nhiều nhất
                          </p>
                          <div className="space-y-3">
                             {weeklyData.topPraise.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                   <span className="font-medium text-gray-700">{item.name}</span>
                                   <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black">{item.count} lượt</span>
                                </div>
                             ))}
                             {weeklyData.topPraise.length === 0 && <p className="text-xs text-gray-400 italic">Chưa có ghi nhận khen ngợi</p>}
                          </div>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-orange-600 uppercase mb-4 flex items-center gap-1">
                             <AlertTriangle size={14} fill="currentColor"/> Nhắc nhở nhiều nhất
                          </p>
                          <div className="space-y-3">
                             {weeklyData.topWarn.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                   <span className="font-medium text-gray-700">{item.name}</span>
                                   <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black">{item.count} lượt</span>
                                </div>
                             ))}
                             {weeklyData.topWarn.length === 0 && <p className="text-xs text-gray-400 italic">Chưa có ghi nhận nhắc nhở</p>}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-100">
                 <h3 className="font-bold text-xl mb-4">Nhận xét của GV</h3>
                 <textarea 
                   className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30 h-64"
                   placeholder="Nhập nhận xét tổng quát cho cả tuần tại đây..."
                 ></textarea>
                 <button className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg">Lưu báo cáo tuần</button>
              </div>
           </div>
        </div>
      ) : activeTab === 'monthly' && monthlyData ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Chuyên cần trung bình</p>
                 <div className="w-24 h-24 rounded-full border-8 border-green-500 flex items-center justify-center mb-4">
                    <span className="text-xl font-black">{monthlyData.attendanceRate.toFixed(0)}%</span>
                 </div>
                 <p className="text-xs text-gray-500">Tăng 2% so với tháng trước</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tổng lượt khen / nhắc</p>
                 <div className="flex gap-8 mb-4">
                    <div className="text-center">
                       <h4 className="text-3xl font-black text-green-600">{monthlyData.praiseCount}</h4>
                       <p className="text-[10px] font-bold text-gray-400">KHEN NGỢI</p>
                    </div>
                    <div className="text-center">
                       <h4 className="text-3xl font-black text-orange-600">{monthlyData.warnCount}</h4>
                       <p className="text-[10px] font-bold text-gray-400">NHẮC NHỞ</p>
                    </div>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tỷ lệ hoàn thành nhiệm vụ</p>
                 <h4 className="text-4xl font-black text-indigo-600 mb-2">{monthlyData.taskCompletionRate}%</h4>
                 <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{width: `${monthlyData.taskCompletionRate}%`}}></div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Xếp hạng rèn luyện tháng</h3>
              <div className="space-y-4">
                 {monthlyData.topStudents.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                       <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                          {i + 1}
                       </span>
                       <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{s.name}</h4>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                             <div className="bg-indigo-500 h-full" style={{width: `${(s.score / 120) * 100}%`}}></div>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-indigo-600">{s.score}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Điểm tích lũy</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReportsPage;
