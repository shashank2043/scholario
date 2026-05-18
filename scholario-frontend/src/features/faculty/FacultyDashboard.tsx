import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Star, Clock, AlertTriangle, Send, GraduationCap, ChevronRight, PlusCircle, LayoutDashboard, RefreshCw } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/CustomSelect';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      fullName
    }
  }
`;

const GET_FACULTY_STATS = gql`
  query GetFacultyStats($facultyId: ID!) {
    getBooksByFaculty(facultyId: $facultyId) {
      id
      state {
        type
      }
    }
    getCoursesByFaculty(facultyId: $facultyId) {
      id
    }
    getFacultyPerformance(facultyId: $facultyId) {
      totalStudentEngagement
    }
    getMyNotifications {
      id
      type
      message
      createdAt
    }
  }
`;

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    getDepartments {
      id
      name
    }
  }
`;

const CREATE_BOOK = gql`
  mutation CreateBook($input: BookInput!) {
    createBook(input: $input) {
      id
      title
      isbn
    }
  }
`;

const StatCard = ({ icon: Icon, label, value, color, delay }: { icon: any, label: string, value: string | number, color: string, delay: string }) => (
  <div 
    className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 animate-slide-up opacity-0 card-tactile hover:border-indigo-100 transition-all`}
    style={{ animationDelay: delay }}
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { data: profileData } = useQuery(GET_MY_PROFILE);
  const facultyId = profileData?.getMyProfile?.id;

  const { data: statsData, loading: statsLoading } = useQuery(GET_FACULTY_STATS, {
    variables: { facultyId },
    skip: !facultyId
  });

  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS);
  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: ['GetFacultyStats'],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createBook({
        variables: {
          input: { title, isbn, description }
        }
      });
      setIsModalOpen(false);
      setTitle('');
      setIsbn('');
      setDescription('');
      navigate('/faculty/books');
    } catch (err) {
      console.error('Error creating book:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bookCount = statsData?.getBooksByFaculty.length || 0;
  const courseCount = statsData?.getCoursesByFaculty.length || 0;
  const publishedCount = statsData?.getBooksByFaculty.filter((b: any) => b.state.type === 'PUBLISHED').length || 0;
  const studentImpact = statsData?.getFacultyPerformance?.totalStudentEngagement || 0;
  const notifications = statsData?.getMyNotifications || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
                <LayoutDashboard size={18} />
             </div>
             <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase truncate">Academic Command</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium font-mono truncate">FACULTY_ID: {facultyId?.substring(0, 8) || 'SYNCING'} // PUBLICATION_OVERWATCH</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 shrink-0"
        >
          <PlusCircle size={16} />
          <span>Draft New Resource</span>
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard icon={BookOpen} label="Authored Books" value={statsLoading ? '...' : bookCount} color="bg-blue-50 text-blue-600" delay="100ms" />
        <StatCard icon={GraduationCap} label="Active Courses" value={statsLoading ? '...' : courseCount} color="bg-indigo-50 text-indigo-600" delay="200ms" />
        <StatCard icon={Star} label="Published Works" value={statsLoading ? '...' : publishedCount} color="bg-emerald-50 text-emerald-600" delay="300ms" />
        <StatCard icon={Users} label="Student Impact" value={statsLoading ? '...' : studentImpact} color="bg-amber-50 text-amber-600" delay="400ms" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm card-tactile animate-slide-up opacity-0" style={{ animationDelay: '500ms' }}>
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <Clock size={16} className="mr-2 text-indigo-500" /> Recent Activity Registry
                 </h4>
                 <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">View All Archive</button>
              </div>
              <div className="space-y-4">
                 {notifications.length === 0 ? (
                   <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent activity detected</p>
                   </div>
                 ) : notifications.slice(0, 5).map((notif: any) => (
                   <div key={notif.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all">
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                            {notif.type === 'BOOK' ? <BookOpen size={20} /> : <AlertTriangle size={20} />}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 line-clamp-1">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                              Type: {notif.type} // {new Date(notif.createdAt).toLocaleTimeString()}
                            </p>
                         </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 p-6 rounded-2xl text-white animate-slide-up opacity-0 shadow-xl shadow-slate-200" style={{ animationDelay: '600ms' }}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Infrastructure Hub</h4>
              <div className="space-y-3">
                 <button onClick={() => navigate('/faculty/books')} className="w-full text-left p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all flex justify-between items-center group">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-200 group-hover:text-white">Publication Engine</span>
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-indigo-400" />
                 </button>
                 <button onClick={() => navigate('/faculty/courses')} className="w-full text-left p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all flex justify-between items-center group">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-200 group-hover:text-white">Curriculum Master</span>
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-indigo-400" />
                 </button>
                 <button onClick={() => navigate('/faculty/settings')} className="w-full text-left p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all flex justify-between items-center group">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-200 group-hover:text-white">Identity Matrix</span>
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-indigo-400" />
                 </button>
              </div>
           </div>

           <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start space-x-3 animate-slide-up opacity-0" style={{ animationDelay: '700ms' }}>
              <AlertTriangle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                 <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Policy Alert</p>
                 <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">All academic resources must undergo peer-review before global publication.</p>
              </div>
           </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Draft Resource" 
        subtitle="Initialize a new publication in the Scholario registry"
      >
        <form onSubmit={handleCreateBook} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publication Title</label>
            <input 
              required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Quantum Mechanics"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry ISBN</label>
              <input 
                required type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-sm"
              />
            </div>
            <CustomSelect 
              label="Authored Dept"
              options={deptData?.getDepartments.map((d: any) => ({ id: d.id, name: d.name })) || []}
              value={departmentId}
              onChange={setDepartmentId}
              placeholder={deptLoading ? "Syncing..." : "Select Unit"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource Abstract</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Module summary and publication scope..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm h-32 resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || deptLoading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <><Send size={16} /> <span>Initialize Publication</span></>}
          </button>
        </form>
      </Modal>
    </div>
  );
};
