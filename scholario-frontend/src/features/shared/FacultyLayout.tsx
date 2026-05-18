import { LayoutDashboard, BookOpen, GraduationCap, Settings, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
}

const SidebarItem = ({ icon: Icon, label, to }: SidebarItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export const FacultyLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">Scholario</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/faculty/dashboard" />
          <SidebarItem icon={BookOpen} label="My Books" to="/faculty/books" />
          <SidebarItem icon={GraduationCap} label="My Courses" to="/faculty/courses" />
          <SidebarItem icon={Settings} label="Settings" to="/faculty/settings" />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">Faculty Portal</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome, Professor</span>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              P
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
};
