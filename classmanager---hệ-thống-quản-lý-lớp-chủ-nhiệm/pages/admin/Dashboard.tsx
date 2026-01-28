
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Student, Announcement, Task, Behavior } from '../../core/types';
import { 
  Users, Star, Bell, ClipboardList, TrendingUp, 
  AlertTriangle, Plus, Calendar, CheckCircle, ArrowRight, Table
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const navigate = useNavigate();

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRW4tOrJeRLLgURh_79GWhM4agrBXpmwNWtMUP6cf9MCBb_bv_UjK5npW962eId7G8dpM_UV8_9ZOs/pubhtml";

  useEffect(() => {
    provider.getStudents().then(setStudents);
    provider.getAnnouncements().then(setAnnouncements);
    provider.getTasks().then(setTasks);
    provider.getBehaviors().then(setBehaviors);
  }, []);

  const totalPraise = behaviors.filter(b => b.type === 'PRAISE').length;
  const totalWarn = behaviors.filter(b => b.type === 'WARN').length;
  const activeStudents = students.filter(s => s.status === 'Đang học').length;

  const stats = [
    { label: 'Sĩ số hiện diện', value: activeStudents, total: students.length, icon: <Users size={24}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Lượt tuyên dương', value: totalPraise, icon: <Star size={24}/>, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Cần nhắc nhở', value: totalWarn, icon: <AlertTriangle size={24}/>, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Bài tập/Nhiệm vụ', value: tasks.length, icon: <ClipboardList size={24}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const chartData = [...students]
    .sort((a,b) => b.behaviorScore - a.behaviorScore)
    .slice(0, 5)
    .map(s => ({ name: s.fullName.split(' ').pop(), score: s.behaviorScore, fullName: s.fullName }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Chào buổi sáng, Thầy/Cô!</h2>
          <p className="text-gray-500 font-medium mt-1">Dữ liệu được đồng bộ trực tiếp từ Google Sheets.</p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10 w-full md:w-auto">
          <a 
            href={SHEET_URL} 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 md:flex-none bg-emerald-50 text-emerald-700 border border-emerald-100 px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-100 transition shadow-sm"
          >
            <Table size={18}/> <span>Xem Bảng tính</span>
          </a>
          <button onClick={() => navigate('/admin/students')} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
            <Plus size={18}/> Thêm học sinh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`${s.bg} ${s.color} p-4 rounded-2xl shadow-inner`}>{s.icon}</div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                {s.total && <span className="text-xs text-gray-400 font-bold">/ {s.total}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="font-black text-xl text-gray-900">Top học sinh tiêu biểu</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Xếp hạng theo điểm rèn luyện</p>
             </div>
             <div className="bg-amber-50 text-amber-600 p-2 rounded-xl"><Star size={20} fill="currentColor"/></div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={12} fontWeight="700" tickLine={false} axisLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis fontSize={12} fontWeight="700" tickLine={false} axisLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                />
                <Bar dataKey="score" radius={[12, 12, 0, 0]} barSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent Behaviors */}
        <div className="space-y-8">
          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
             <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <CheckCircle size={20} className="text-indigo-300"/> Việc cần làm ngay
             </h3>
             <div className="space-y-4">
                <button onClick={() => navigate('/admin/attendance')} className="w-full bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-2xl flex items-center justify-between transition-all group">
                   <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-indigo-300"/>
                      <span className="font-bold text-sm">Điểm danh hôm nay</span>
                   </div>
                   <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all"/>
                </button>
                <button onClick={() => navigate('/admin/behavior')} className="w-full bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-2xl flex items-center justify-between transition-all group">
                   <div className="flex items-center gap-3">
                      <Star size={18} className="text-indigo-300"/>
                      <span className="font-bold text-sm">Ghi nhận nề nếp</span>
                   </div>
                   <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all"/>
                </button>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-900">Ghi nhận mới</h3>
                <TrendingUp size={16} className="text-indigo-600"/>
             </div>
             <div className="space-y-4">
                {behaviors.slice(0, 3).map((b) => (
                  <div key={b.id} className="flex gap-4 group">
                     <div className={`w-1 h-10 rounded-full shrink-0 ${b.type === 'PRAISE' ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                     <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{students.find(s => s.id === b.studentId)?.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{b.content}</p>
                     </div>
                  </div>
                ))}
                {behaviors.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">Chưa có ghi nhận nề nếp mới.</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
