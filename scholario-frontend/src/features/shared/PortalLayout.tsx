import { LucideIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  to: string;
}

interface PortalLayoutProps {
  title: string;
  navItems: NavItem[];
}

const SidebarItem = ({ icon: Icon, label, to, onClick }: NavItem & { onClick?: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
        isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`
    }
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
);

export const PortalLayout = ({ title, navItems }: PortalLayoutProps) => {
  const { logout, username, role, allRoles, switchRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Scholario</h1>
        <button 
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <SidebarItem key={item.to} {...item} onClick={() => setIsMobileMenuOpen(false)} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        {allRoles.length > 1 && (
          <div className="mb-4 px-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Switch Portal</p>
            <div className="space-y-1">
              {allRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={r === role}
                  className={`w-full text-left px-3 py-1.5 rounded text-[11px] font-semibold transition-colors uppercase tracking-tight ${
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
          className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 truncate">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-none">{username}</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{role}</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              {username?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};
