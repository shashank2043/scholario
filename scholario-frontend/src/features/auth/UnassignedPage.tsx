import { AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from './useAuth';

export const UnassignedPage = () => {
  const { logout, username } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-50 rounded-full">
            <AlertCircle size={48} className="text-amber-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Unassigned</h2>
        <p className="text-gray-600 mb-8">
          Hello <span className="font-semibold">{username}</span>, your account has been successfully authenticated, but you haven't been assigned a role yet.
        </p>
        
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-8 text-sm text-amber-700 text-left">
          <p className="font-semibold mb-1">What should I do?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Contact your system administrator.</li>
            <li>Request a role assignment (Faculty, Student, or Librarian).</li>
            <li>Wait for administrative approval.</li>
          </ul>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
