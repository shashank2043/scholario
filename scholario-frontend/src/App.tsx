import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { client } from './graphql/client';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { PortalLayout, NavItem } from './features/shared/PortalLayout';
import { FacultyDashboard } from './features/faculty/FacultyDashboard';
import { BookManagement } from './features/faculty/BookManagement';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { StudentDashboard } from './features/student/StudentDashboard';
import { LibrarianDashboard } from './features/librarian/LibrarianDashboard';
import { UnassignedPage } from './features/auth/UnassignedPage';
import { 
  LayoutDashboard, BookOpen, GraduationCap, Settings, 
  ShieldAlert, Users, Library, Search 
} from 'lucide-react';

const RoleProtectedRoute = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
  const { authenticated, role } = useAuth();
  
  if (!authenticated) return null; // Keycloak redirects to login anyway
  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const FacultyPortal = () => {
  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/faculty/dashboard' },
    { icon: BookOpen, label: 'My Books', to: '/faculty/books' },
    { icon: GraduationCap, label: 'My Courses', to: '/faculty/courses' },
    { icon: Settings, label: 'Settings', to: '/faculty/settings' },
  ];
  return (
    <RoleProtectedRoute allowedRoles={['FACULTY']}>
      <PortalLayout title="Faculty Portal" navItems={navItems} />
    </RoleProtectedRoute>
  );
};

const AdminPortal = () => {
  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
    { icon: ShieldAlert, label: 'Security', to: '/admin/security' },
    { icon: Users, label: 'Departments', to: '/admin/departments' },
    { icon: Settings, label: 'Settings', to: '/admin/settings' },
  ];
  return (
    <RoleProtectedRoute allowedRoles={['ADMIN']}>
      <PortalLayout title="Admin Portal" navItems={navItems} />
    </RoleProtectedRoute>
  );
};

const StudentPortal = () => {
  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'My Library', to: '/student/dashboard' },
    { icon: Search, label: 'Search Books', to: '/student/search' },
    { icon: GraduationCap, label: 'My Courses', to: '/student/courses' },
    { icon: Settings, label: 'Settings', to: '/student/settings' },
  ];
  return (
    <RoleProtectedRoute allowedRoles={['STUDENT']}>
      <PortalLayout title="Student Portal" navItems={navItems} />
    </RoleProtectedRoute>
  );
};

const LibrarianPortal = () => {
  const navItems: NavItem[] = [
    { icon: Library, label: 'Circulation', to: '/librarian/dashboard' },
    { icon: Search, label: 'Manage Stock', to: '/librarian/stock' },
    { icon: Settings, label: 'Settings', to: '/librarian/settings' },
  ];
  return (
    <RoleProtectedRoute allowedRoles={['LIBRARIAN']}>
      <PortalLayout title="Librarian Portal" navItems={navItems} />
    </RoleProtectedRoute>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/faculty" element={<FacultyPortal />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="books" element={<BookManagement />} />
              <Route path="courses" element={<div>Course Content</div>} />
              <Route path="settings" element={<div>Settings Content</div>} />
            </Route>

            <Route path="/admin" element={<AdminPortal />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="security" element={<AdminDashboard />} />
              <Route path="departments" element={<div>Departments Management</div>} />
              <Route path="settings" element={<div>Settings Content</div>} />
            </Route>

            <Route path="/student" element={<StudentPortal />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="search" element={<div>Search Books</div>} />
              <Route path="courses" element={<div>My Courses</div>} />
              <Route path="settings" element={<div>Settings Content</div>} />
            </Route>

            <Route path="/librarian" element={<LibrarianPortal />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LibrarianDashboard />} />
              <Route path="stock" element={<div>Stock Management</div>} />
              <Route path="settings" element={<div>Settings Content</div>} />
            </Route>

            <Route path="/unassigned" element={<UnassignedPage />} />

            {/* Role-based redirection at root */}
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}

const RootRedirect = () => {
  const { role } = useAuth();
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'FACULTY') return <Navigate to="/faculty" replace />;
  if (role === 'LIBRARIAN') return <Navigate to="/librarian" replace />;
  if (role === 'STUDENT') return <Navigate to="/student" replace />;
  if (role === 'UNASSIGNED') return <Navigate to="/unassigned" replace />;
  return <div className="flex items-center justify-center h-screen">Redirecting to your portal...</div>;
};

export default App;
