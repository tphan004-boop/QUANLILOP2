
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Student, Attendance } from '../../core/types';
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceHistory: React.FC = () => {
  const [child, setChild] = useState<Student | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const students = await provider.getStudents();
      const firstChild = students[0]; // Mocking the first student as the current user's child
      if (firstChild) {
        setChild(firstChild);
        const data = await provider.getAttendanceByStudent(firstChild.id);
        setHistory(data.sort((a, b) => b.date.localeCompare(a.date)));
      }
    };
    loadData();
  }, []);

  const getStatusBadge = (status: Attendance['status']) => {
    switch (status) {
      case 'PRESENT': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">CÓ MẶT</span>;
      case 'ABSENT': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold">VẮNG</span>;
      case 'LATE': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold">TRỄ</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Lịch sử Chuyên cần</h2>
        <p className="text-gray-500">Theo dõi tình hình đến lớp của {child?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600"/>
              Bảng theo dõi
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Có mặt</span>
               <span className="flex items-center gap-1 ml-3"><div className="w-2 h-2 rounded-full bg-red-500"></div> Vắng</span>
               <span className="flex items-center gap-1 ml-3"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Trễ</span>
            </div>
          </div>
          <div className="divide-y">
            {history.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">Chưa có dữ liệu điểm danh</div>
            ) : (
              history.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900">{new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {item.note && <p className="text-xs text-gray-500 mt-1 italic">Ghi chú: {item.note}</p>}
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg">
             <h3 className="font-bold text-lg mb-4">Thống kê tháng này</h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Số ngày có mặt</span>
                  <span className="text-2xl font-bold">{history.filter(h => h.status === 'PRESENT').length}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Số ngày vắng</span>
                  <span className="text-2xl font-bold">{history.filter(h => h.status === 'ABSENT').length}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Số lần đi trễ</span>
                  <span className="text-2xl font-bold">{history.filter(h => h.status === 'LATE').length}</span>
               </div>
               <div className="pt-4 border-t border-indigo-400">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Tỉ lệ chuyên cần</span>
                    <span className="text-2xl font-bold">98%</span>
                  </div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
             <h4 className="font-bold text-gray-700 mb-2">Lời nhắc chuyên cần</h4>
             <p className="text-sm text-gray-500 leading-relaxed">
               Học sinh cần duy trì tỉ lệ chuyên cần trên 95% để đảm bảo kết quả rèn luyện tốt nhất. Nếu có lý do vắng mặt, phụ huynh vui lòng gửi lời nhắn hoặc liên hệ GVCN trước 7:30 sáng.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
