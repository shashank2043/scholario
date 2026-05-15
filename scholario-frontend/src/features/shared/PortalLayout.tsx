import { LucideIcon, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { NavLink, Outlet } from 'react-router-dom';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  to: string;
}

interface PortalLayoutProps {
  title: string;
  navItems: NavItem[];
}

const SidebarItem = ({ icon: Icon, label, to }: NavItem) => (
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

export const PortalLayout = ({ title, navItems }: PortalLayoutProps) => {
  const { logout, username, role, allRoles, switchRole } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ... rest of sidebar ... */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">Scholario</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <SidebarItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          {allRoles.length > 1 && (
            <div className="mb-4 px-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Switch Portal</p>
              <div className="space-y-1">
                {allRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    disabled={r === role}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      r === role ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {r} Portal
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{username}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {username?.[0].toUpperCase()}
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
