
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
import { 
  LayoutDashboard, Users, Calendar, MessageSquare, 
  ClipboardList, Bell, FileText, Star, GraduationCap, Home, School, UserCircle, Megaphone, TrendingUp, Info
} from 'lucide-react';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Classes from './pages/admin/Classes';
import Parents from './pages/admin/Parents';
import AttendancePage from './pages/admin/AttendancePage';
import BehaviorPage from './pages/admin/BehaviorPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import DocumentsPage from './pages/admin/DocumentsPage';
import TasksPage from './pages/admin/TasksPage';
import MessagesPage from './pages/admin/MessagesPage';
import ReportsPage from './pages/admin/ReportsPage';
import ClassProfilePage from './pages/admin/ClassProfilePage';

// App Pages
import ParentDashboard from './pages/app/ParentDashboard';
import AttendanceHistory from './pages/app/AttendanceHistory';
import BehaviorHistory from './pages/app/BehaviorHistory';
import AnnouncementsView from './pages/app/AnnouncementsView';
import DocumentsView from './pages/app/DocumentsView';
import TasksView from './pages/app/TasksView';
import MessagesView from './pages/app/MessagesView';
import ClassInfoPage from './pages/app/ClassInfoPage';

const LandingPage = () => (
  <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-8">
      <div>
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={40}/>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ClassManager</h1>
        <p className="text-gray-500 mt-2">Hệ thống quản lý lớp học toàn diện</p>
      </div>
      <div className="grid gap-4">
        <Link to="/admin" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
           <LayoutDashboard size={20}/>
           <span>Cổng Giáo viên</span>
        </Link>
        <Link to="/app" className="w-full bg-white text-indigo-600 border-2 border-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition flex items-center justify-center gap-2">
           <Home size={20}/>
           <span>Cổng Phụ huynh / Học sinh</span>
        </Link>
      </div>
      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Phiên bản 1.0.0</p>
    </div>
  </div>
);

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const items = [
    { icon: <LayoutDashboard size={20}/>, label: 'Bảng điều khiển', path: '/admin/dashboard' },
    { icon: <School size={20}/>, label: 'Quản lý lớp', path: '/admin/classes' },
    { icon: <Info size={20}/>, label: 'Hồ sơ lớp học', path: '/admin/class-info' },
    { icon: <Users size={20}/>, label: 'Học sinh', path: '/admin/students' },
    { icon: <UserCircle size={20}/>, label: 'Phụ huynh', path: '/admin/parents' },
    { icon: <Calendar size={20}/>, label: 'Điểm danh', path: '/admin/attendance' },
    { icon: <Star size={20}/>, label: 'Nề nếp / Hành vi', path: '/admin/behavior' },
    { icon: <Megaphone size={20}/>, label: 'Thông báo', path: '/admin/announcements' },
    { icon: <FileText size={20}/>, label: 'Hồ sơ & Học liệu', path: '/admin/documents' },
    { icon: <ClipboardList size={20}/>, label: 'Bài tập / Nhắc việc', path: '/admin/tasks' },
    { icon: <TrendingUp size={20}/>, label: 'Báo cáo tổng kết', path: '/admin/reports' },
    { icon: <MessageSquare size={20}/>, label: 'Tin nhắn', path: '/admin/messages' },
  ];
  return <Layout items={items} title="Admin Portal" role="admin">{children}</Layout>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const items = [
    { icon: <LayoutDashboard size={20}/>, label: 'Tổng quan', path: '/app/dashboard' },
    { icon: <Info size={20}/>, label: 'Thông tin lớp học', path: '/app/class-info' },
    { icon: <Calendar size={20}/>, label: 'Chuyên cần', path: '/app/attendance' },
    { icon: <Star size={20}/>, label: 'Rèn luyện', path: '/app/behavior' },
    { icon: <Megaphone size={20}/>, label: 'Thông báo', path: '/app/announcements' },
    { icon: <FileText size={20}/>, label: 'Học liệu', path: '/app/documents' },
    { icon: <ClipboardList size={20}/>, label: 'Nhiệm vụ', path: '/app/tasks' },
    { icon: <MessageSquare size={20}/>, label: 'Liên hệ GV', path: '/app/messages' },
  ];
  return <Layout items={items} title="ClassApp" role="app">{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/classes" element={<AdminLayout><Classes /></AdminLayout>} />
        <Route path="/admin/class-info" element={<AdminLayout><ClassProfilePage /></AdminLayout>} />
        <Route path="/admin/students" element={<AdminLayout><Students /></AdminLayout>} />
        <Route path="/admin/parents" element={<AdminLayout><Parents /></AdminLayout>} />
        <Route path="/admin/attendance" element={<AdminLayout><AttendancePage /></AdminLayout>} />
        <Route path="/admin/behavior" element={<AdminLayout><BehaviorPage /></AdminLayout>} />
        <Route path="/admin/announcements" element={<AdminLayout><AnnouncementsPage /></AdminLayout>} />
        <Route path="/admin/documents" element={<AdminLayout><DocumentsPage /></AdminLayout>} />
        <Route path="/admin/tasks" element={<AdminLayout><TasksPage /></AdminLayout>} />
        <Route path="/admin/messages" element={<AdminLayout><MessagesPage /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><ReportsPage /></AdminLayout>} />
        <Route path="/admin/*" element={<AdminLayout><div className="text-center py-20 text-gray-400">Chức năng đang phát triển...</div></AdminLayout>} />

        {/* App Routes */}
        <Route path="/app" element={<Navigate to="/app/dashboard" />} />
        <Route path="/app/dashboard" element={<AppLayout><ParentDashboard /></AppLayout>} />
        <Route path="/app/class-info" element={<AppLayout><ClassInfoPage /></AppLayout>} />
        <Route path="/app/attendance" element={<AppLayout><AttendanceHistory /></AppLayout>} />
        <Route path="/app/behavior" element={<AppLayout><BehaviorHistory /></AppLayout>} />
        <Route path="/app/announcements" element={<AppLayout><AnnouncementsView /></AppLayout>} />
        <Route path="/app/documents" element={<AppLayout><DocumentsView /></AppLayout>} />
        <Route path="/app/tasks" element={<AppLayout><TasksView /></AppLayout>} />
        <Route path="/app/messages" element={<AppLayout><MessagesView /></AppLayout>} />
        <Route path="/app/*" element={<AppLayout><div className="text-center py-20 text-gray-400">Chức năng đang phát triển...</div></AppLayout>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
