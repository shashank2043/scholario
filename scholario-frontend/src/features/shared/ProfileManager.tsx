import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { User as UserIcon, Mail, Save, ShieldCheck, Loader2 } from 'lucide-react';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      username
      email
      fullName
      roles
      department {
        id
        name
      }
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateUserProfile($input: ProfileInput!) {
    updateUserProfile(input: $input) {
      id
      email
      fullName
    }
  }
`;

interface UserProfile {
    id: string;
    username: string;
    email: string;
    fullName: string;
    roles: string[];
    department?: {
        id: string;
        name: string;
    };
}

const ProfileForm = ({ user }: { user: UserProfile }) => {
  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        variables: {
          input: {
            fullName: formData.fullName,
            email: formData.email,
          },
        },
      });
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Update failed. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Profile Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <UserIcon size={24} />
          </div>
          <div>
            <h4 className="font-black text-slate-900 uppercase tracking-tighter text-lg">{user.fullName || 'New User'}</h4>
            <p className="text-xs text-slate-400 font-mono">ID: {user.id.substring(0, 8)}... // @{user.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-medium transition-all"
              />
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-medium transition-all"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={updating}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs btn-tactile disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <span>Commit Changes</span>
        </button>
      </div>

      {/* Security / Metadata */}
      <div className="space-y-6">
        <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} />
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Account Metadata</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Roles</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.roles.map((r: string) => (
                    <span key={r} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest">{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Academic Unit</p>
                <p className="text-xs font-bold mt-1 text-slate-300">{user.department?.name || 'Central Infrastructure'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border border-slate-100 rounded-3xl bg-white space-y-2">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Infrastructure Connection</h5>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your profile is synchronized with the global Scholario registry. Changes here will propagate to all academic nodes.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ProfileManager = () => {
  const { data, loading, error } = useQuery(GET_MY_PROFILE);

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin text-indigo-600 mr-2" />
      <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Fetching Profile Node...</span>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
      <p className="font-black uppercase tracking-tighter text-sm mb-1">Link Error: Profile Synchronization Failed</p>
      <p className="text-xs font-medium opacity-80">Unable to establish secure tunnel to user identity service.</p>
    </div>
  );

  return <ProfileForm key={(data as any).getMyProfile.id} user={(data as any).getMyProfile} />;
};
