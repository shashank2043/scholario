import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Settings, User, Mail, Shield, Save, RefreshCw, Library } from 'lucide-react';

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

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateUserProfile(input: $input) {
      id
      fullName
      email
    }
  }
`;

export const LibrarianSettings = () => {
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
      alert('Librarian profile synchronized');
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to synchronize registry');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-black uppercase animate-pulse tracking-widest">Accessing secure archive...</div>;

  const profile = data?.getMyProfile;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Registry Node Configuration</h2>
        <p className="text-sm text-slate-500 font-medium">Manage your professional identity and archive access settings</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border-2 border-slate-50 p-8 shadow-sm text-center">
            <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-emerald-100">
              <Library size={48} />
            </div>
            <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">{profile?.fullName}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest font-mono">NODE_ID: {profile?.id.substring(0, 8)}</p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-wider">
                Librarian
              </span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center">
              <Shield size={14} className="mr-2" /> Clearance Level
            </h5>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Circulation Auth</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase">Granted</span>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stock Management</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase">Full Control</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <Settings size={16} className="mr-2 text-emerald-600" /> Identity Synchronization
              </h4>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center ml-1">
                    <User size={12} className="mr-2" /> Professional Name
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center ml-1">
                    <Mail size={12} className="mr-2" /> Registry Email
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-50">
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
                  className="flex items-center space-x-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                >
                  {updating ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Synchronize Node</span>
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:border-emerald-200 transition-all">
            <div>
               <h5 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center mb-1">
                 <Shield size={16} className="mr-2 text-slate-400 group-hover:text-emerald-600 transition-colors" /> Security Protocol
               </h5>
               <p className="text-[11px] text-slate-500 font-medium">Reset your secure access pin and circulation credentials.</p>
            </div>
            <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              Reset Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
