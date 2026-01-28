
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Student, ClassInfo, Attendance } from '../../core/types';
import { Save, Filter, CheckCircle, XCircle, Clock, Search, FileDown } from 'lucide-react';

const AttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: Attendance['status'], note: string }>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    provider.getClasses().then(cls => {
      setClasses(cls);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;

    const loadData = async () => {
      setLoading(true);
      const [stList, existingAttendance] = await Promise.all([
        provider.getStudents(selectedClassId),
        provider.getAttendanceByClassAndDate(selectedClassId, date)
      ]);

      setStudents(stList);
      
      const newMap: Record<string, { status: Attendance['status'], note: string }> = {};
      stList.forEach(s => {
        const found = existingAttendance.find(a => a.studentId === s.id);
        newMap[s.id] = {
          status: found ? found.status : 'PRESENT',
          note: found?.note || ''
        };
      });
      setAttendanceMap(newMap);
      setLoading(false);
    };

    loadData();
  }, [selectedClassId, date]);

  const handleStatusChange = (studentId: string, status: Attendance['status']) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
    }));
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    
    const items = (Object.entries(attendanceMap) as [string, { status: Attendance['status'], note: string }][]).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note
    }));

    try {
      await provider.markAttendance(selectedClassId, date, items);
      alert('Đã lưu dữ liệu điểm danh thành công!');
    } catch (err) {
      alert('Lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Student Name", "Status", "Note", "Date"];
    const rows = students.map(s => [
      s.fullName,
      attendanceMap[s.id]?.status || 'PRESENT',
      attendanceMap[s.id]?.note || '',
      date
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedClassId}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Điểm danh & Chuyên cần</h2>
          <p className="text-sm text-gray-500">Ghi nhận tình trạng hiện diện của học sinh theo ngày</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={exportCSV}
            className="bg-white text-gray-700 border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <FileDown size={18}/>
            <span>Xuất CSV</span>
          </button>
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
            <Filter size={16} className="text-gray-400" />
            <select 
              className="outline-none text-sm bg-transparent"
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
          </div>
          <input 
            type="date" 
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white" 
            value={date} 
            onChange={e => setDate(e.target.value)}
          />
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Save size={18}/>
            <span>{loading ? 'Đang lưu...' : 'Lưu tất cả'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm học sinh trong lớp..." 
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 font-medium text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Học sinh</th>
                <th className="px-6 py-4">Tình trạng</th>
                <th className="px-6 py-4">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">Không có dữ liệu học sinh</td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                           {s.fullName.charAt(0)}
                         </div>
                         <span className="font-medium text-gray-900">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(s.id, 'PRESENT')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                            ${attendanceMap[s.id]?.status === 'PRESENT' 
                              ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' 
                              : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}
                          `}
                        >
                          <CheckCircle size={14}/> Có mặt
                        </button>
                        <button
                          onClick={() => handleStatusChange(s.id, 'ABSENT')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                            ${attendanceMap[s.id]?.status === 'ABSENT' 
                              ? 'bg-red-100 text-red-700 border-red-200 shadow-sm' 
                              : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}
                          `}
                        >
                          <XCircle size={14}/> Vắng
                        </button>
                        <button
                          onClick={() => handleStatusChange(s.id, 'LATE')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                            ${attendanceMap[s.id]?.status === 'LATE' 
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm' 
                              : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}
                          `}
                        >
                          <Clock size={14}/> Trễ
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        placeholder="Ghi chú thêm..." 
                        value={attendanceMap[s.id]?.note || ''}
                        onChange={e => handleNoteChange(s.id, e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded px-3 py-1.5 outline-none focus:border-indigo-300 text-xs transition" 
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
