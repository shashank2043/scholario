import { AlertCircle, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Navigate } from 'react-router-dom';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      username
      email
      fullName
      roles
    }
  }
`;

export const UnassignedPage = () => {
  const { logout, username, role } = useAuth();
  
  const { loading } = useQuery(GET_MY_PROFILE, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('[Auth] User profile synced with backend:', data?.getMyProfile?.username);
    },
    onError: (error) => {
      console.error('[Auth] Profile sync failed:', error);
    }
  });

  // If the user already has a functional role, redirect them back to the root
  // where the RootRedirect will send them to the correct portal.
  if (role && role !== 'UNASSIGNED') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-50 rounded-full">
            {loading ? (
              <Loader2 size={48} className="text-amber-600 animate-spin" />
            ) : (
              <AlertCircle size={48} className="text-amber-600" />
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {loading ? 'Synchronizing Account...' : 'Account Unassigned'}
        </h2>
        <p className="text-gray-600 mb-8">
          Hello <span className="font-semibold">{username}</span>, your account has been successfully authenticated, but you haven't been assigned a functional role yet.
        </p>
        
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-8 text-sm text-amber-700 text-left">
          <p className="font-semibold mb-1">What should I do?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your account is being registered in our system.</li>
            <li>Contact your system administrator for role assignment.</li>
            <li>Request a role (Faculty, Student, or Librarian).</li>
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
