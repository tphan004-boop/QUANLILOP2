
import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Users, Calendar, MessageSquare, ClipboardList, 
  Bell, FileText, LayoutDashboard, Star, Menu, X 
} from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface LayoutProps {
  items: SidebarItem[];
  title: string;
  role: 'admin' | 'app';
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ items, title, role, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Toggle */}
      <div className="md:hidden bg-indigo-600 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-lg">{title}</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static transition duration-200 ease-in-out z-40
        w-64 bg-white border-r border-gray-200 flex flex-col h-screen
      `}>
        <div className="p-6 border-b hidden md:block">
          <h1 className="text-xl font-bold text-indigo-600 tracking-tight">{title}</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">
            {role === 'admin' ? 'Giáo viên Chủ nhiệm' : 'Phụ huynh / Học sinh'}
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-600 font-medium' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t bg-gray-50">
           <Link to="/" className="text-xs text-indigo-500 hover:underline font-medium">Đăng xuất</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30 hidden md:flex">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-600 capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600"><Bell size={20}/></button>
            <div className="flex items-center gap-2 border-l pl-4">
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">GV</div>
               <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
