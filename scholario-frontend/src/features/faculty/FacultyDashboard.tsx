import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { BookOpen, Star, Clock, Send, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/CustomSelect';

const GET_ANALYTICS = gql`
  query GetAnalytics {
    analyzeUsagePatterns {
      id
      type
      severity
    }
  }
`;

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    getDepartments {
      id
      name
      code
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

interface AnalyticsData {
  analyzeUsagePatterns: {
    id: string;
    type: string;
    severity: string;
  }[];
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface GetDepartmentsData {
  getDepartments: Department[];
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color: string }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4 card-tactile transition-all hover:shadow-md">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

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
  }
`;

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      fullName
    }
  }
`;

export const FacultyDashboard = () => {
  const { data: profileData } = useQuery<{ getMyProfile: { id: string; fullName: string } }>(GET_MY_PROFILE);
  const facultyId = profileData?.getMyProfile?.id;

  const { data: statsData, loading: statsLoading } = useQuery<{
    getBooksByFaculty: { id: string; state: { type: string } }[];
    getCoursesByFaculty: { id: string }[];
  }>(GET_FACULTY_STATS, {
    variables: { facultyId },
    skip: !facultyId
  });

  const { data: analyticsData, loading: analyticsLoading } = useQuery<AnalyticsData>(GET_ANALYTICS);
  const { data: deptData, loading: deptLoading } = useQuery<GetDepartmentsData>(GET_DEPARTMENTS);
  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: GET_ANALYTICS }],
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
          input: {
            title,
            isbn,
            description
          }
        }
      });
      setIsModalOpen(false);
      setTitle('');
      setIsbn('');
      setDescription('');
      setDepartmentId('');
    } catch (err) {
      console.error('Error creating book:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const authoredBooksCount = statsData?.getBooksByFaculty?.length || 0;
  const activeCoursesCount = statsData?.getCoursesByFaculty?.length || 0;
  const publishedBooks = statsData?.getBooksByFaculty?.filter((b: { state: { type: string } }) => b.state.type === 'PUBLISHED').length || 0;

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Faculty Resource Control</h3>
        <p className="text-gray-500 mt-1 font-medium font-mono uppercase text-xs">Node: {profileData?.getMyProfile?.fullName || '...'} // Global Instructional Mode</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} label="Authored Books" value={statsLoading ? '...' : authoredBooksCount} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={GraduationCap} label="Active Courses" value={statsLoading ? '...' : activeCoursesCount} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Star} label="Published Works" value={statsLoading ? '...' : publishedBooks} color="bg-amber-50 text-amber-600" />
        <StatCard icon={Clock} label="System Alerts" value={analyticsData?.analyzeUsagePatterns.length || 0} color="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm card-tactile">
          <h4 className="font-bold text-gray-800 mb-4">Content Status</h4>
          <div className="flex items-center justify-center h-48 text-gray-400 italic">
            {analyticsLoading ? "Synchronizing data..." : "No active review requests found."}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm card-tactile">
          <h4 className="font-bold text-gray-800 mb-4">Quick Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-4 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-all uppercase tracking-wider btn-tactile"
            >
              Draft New Book
            </button>
            <button className="p-4 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-all uppercase tracking-wider btn-tactile">
              Assign Course
            </button>
            <button className="p-4 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-all uppercase tracking-wider btn-tactile">
              Review Policies
            </button>
            <button className="p-4 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-all uppercase tracking-wider btn-tactile">
              Help Center
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Draft New Book" 
        subtitle="Initialize a new academic resource in the system"
      >
        <form onSubmit={handleCreateBook} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Book Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Quantum Mechanics"
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">ISBN</label>
              <input 
                required
                type="text" 
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-..."
                className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <CustomSelect 
              label="Department"
              options={deptData?.getDepartments.map(d => ({ id: d.id, name: d.name })) || []}
              value={departmentId}
              onChange={setDepartmentId}
              placeholder={deptLoading ? "Loading..." : "Select Dept"}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief summary of the book content..."
              className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none h-32 resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || deptLoading}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all btn-tactile disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : <><Send size={20} /> Create Draft</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};
