import { LucideIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
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
      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-600 hover:bg-gray-100'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export const PortalLayout = ({ title, navItems }: PortalLayoutProps) => {
  const { logout, username, role, allRoles, switchRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tighter uppercase">Scholario</h1>
          <button onClick={closeMobileMenu} className="p-2 lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem key={item.to} {...item} onClick={closeMobileMenu} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white">
          {allRoles.length > 1 && (
            <div className="mb-4 px-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Switch Portal</p>
              <div className="grid grid-cols-1 gap-1">
                {allRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => { switchRole(r); closeMobileMenu(); }}
                    disabled={r === role}
                    className={`text-left px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      r === role ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 lg:hidden text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight uppercase truncate">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">{username}</p>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{role}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border-2 border-indigo-100 shadow-sm">
              {username?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};
