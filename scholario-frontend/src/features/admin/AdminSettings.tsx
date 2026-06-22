import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Settings, User, Mail, Shield, Save, RefreshCw } from 'lucide-react';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      username
      email
      fullName
      roles
      department {
        name
      }
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateUserProfile(input: $input) {
      id
      fullName
      email
    }
  }
`;

export const AdminSettings = () => {
  const { data, loading, refetch } = useQuery(GET_MY_PROFILE);
  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (data?.getMyProfile) {
      setFullName(data.getMyProfile.fullName || '');
      setEmail(data.getMyProfile.email || '');
    }
  }, [data]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        variables: {
          input: { fullName, email }
        }
      });
      alert('Profile updated successfully');
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-black uppercase animate-pulse tracking-widest">Accessing Secure Profile...</div>;

  const profile = data?.getMyProfile;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">System Configuration</h2>
        <p className="text-sm text-slate-500 font-medium">Manage your administrative identity and node settings</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <User size={40} />
            </div>
            <h4 className="font-black text-slate-900 uppercase tracking-tight">{profile?.fullName}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">@{profile?.username}</p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {profile?.roles.map((role: string) => (
                <span key={role} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded border border-indigo-100 uppercase">
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center">
              <Shield size={14} className="mr-2" /> Security Status
            </h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Multi-Factor</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Session Key</span>
                <span className="text-[10px] font-black text-slate-200 uppercase font-mono">STABLE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <Settings size={16} className="mr-2 text-slate-400" /> Identity Settings
              </h4>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                    <User size={12} className="mr-1.5" /> Full Identity Name
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                    <Mail size={12} className="mr-1.5" /> Registry Email
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                <button 
                  type="button"
                  onClick={() => refetch()}
                  className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Reload Data</span>
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                  {updating ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Synchronize Changes</span>
                </button>
              </div>
            </div>
          </form>

          {/* <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-2xl">
            <h5 className="text-xs font-black text-rose-900 uppercase tracking-tight flex items-center mb-2">
              <Shield size={16} className="mr-2" /> Danger Zone
            </h5>
            <p className="text-xs text-rose-700 font-medium mb-4">Requesting node decommissioning or identity revocation requires level 5 authorization.</p>
            <button className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">
              Request Decommission
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};
