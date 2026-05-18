import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Download, 
  ArrowUpRight,
  RefreshCcw,
  BookPlus,
  History
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/CustomSelect';

const ISSUE_BOOK = gql`
  mutation IssueBook($bookId: ID!, $userId: ID!) {
    issueBook(input: { bookId: $bookId, userId: $userId }) {
      id
      dueDate
      state { type }
    }
  }
`;

const RETURN_BOOK = gql`
  mutation ReturnBook($issueId: ID!, $userId: ID!) {
    returnBook(input: { issueId: $issueId, userId: $userId }) {
      id
      returnDate
      state { type }
    }
  }
`;

const GET_DUE_DATES = gql`
  query GetDueDates {
    getDueDates {
      id
      bookId
      userId
      issueDate
      dueDate
      returnDate
      state {
        type
      }
    }
  }
`;

const GET_STUDENTS = gql`
  query GetStudents {
    getStudentList {
      id
      fullName
    }
  }
`;

const GET_BOOKS = gql`
  query GetBooks {
    getAllBooks {
      id
      title
    }
  }
`;

const GET_LIBRARIAN_STATS = gql`
  query GetLibrarianStats {
    getLibrarianStats {
      activeIssues
      overdueIssues
      returnedToday
      activeReservations
    }
  }
`;

interface LibrarianStats {
  activeIssues: number;
  overdueIssues: number;
  returnedToday: number;
  activeReservations: number;
}

interface IssueResponse {
  id: string;
  bookId: string;
  userId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  state: {
    type: string;
  };
}

interface User {
  id: string;
  fullName: string;
}

interface Book {
  id: string;
  title: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  delay: string;
  color: string;
}

const StatCard = ({ title, value, icon, delay, color }: StatCardProps) => (
  <div 
    className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-slide-up opacity-0 flex items-center justify-between hover:border-gray-200 transition-all cursor-default`}
    style={{ animationDelay: delay }}
  >
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
      {icon}
    </div>
  </div>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'indigo' | 'emerald';
  delay: string;
  onClick: () => void;
}

const ActionCard = ({ title, description, icon: Icon, color, delay, onClick }: ActionCardProps) => {
  const colorClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
  };

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: delay }}
      className={`card-tactile w-full p-5 rounded-2xl animate-slide-up opacity-0 flex items-center gap-4 transition-all text-left shadow-lg ${colorClasses[color]}`}
    >
      <div className="p-3 bg-white/20 rounded-xl">
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h5 className="font-bold text-lg">{title}</h5>
        <p className="text-white/80 text-sm leading-tight">{description}</p>
      </div>
      <ArrowUpRight size={20} className="opacity-60" />
    </button>
  );
};

export const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState('');

  const [issueMutation] = useMutation(ISSUE_BOOK);
  const [returnMutation] = useMutation(RETURN_BOOK);
  
  const { loading, error, data, refetch } = useQuery<{ getDueDates: IssueResponse[] }>(GET_DUE_DATES);
  const { data: studentsData } = useQuery<{ getStudentList: User[] }>(GET_STUDENTS);
  const { data: booksData } = useQuery<{ getAllBooks: Book[] }>(GET_BOOKS);
  const { data: statsData } = useQuery<{ getLibrarianStats: LibrarianStats }>(GET_LIBRARIAN_STATS);

  const handleIssue = async () => {
    if (!selectedBook || !selectedStudent) return;
    try {
      await issueMutation({ 
        variables: { bookId: selectedBook, userId: selectedStudent } 
      });
      setIsIssueModalOpen(false);
      setSelectedBook('');
      setSelectedStudent('');
      refetch();
    } catch (err) {
      console.error('Failed to issue book:', err);
    }
  };

  const handleReturn = async () => {
    if (!selectedIssueId || !selectedStudent) return;
    try {
      await returnMutation({ 
        variables: { issueId: selectedIssueId, userId: selectedStudent } 
      });
      setIsReturnModalOpen(false);
      setSelectedIssueId('');
      setSelectedStudent('');
      refetch();
    } catch (err) {
      console.error('Failed to return book:', err);
    }
  };

  const studentOptions = studentsData?.getStudentList.map((s: User) => ({ id: s.id, name: s.fullName })) || [];
  const bookOptions = booksData?.getAllBooks.map((b: Book) => ({ id: b.id, name: b.title })) || [];
  
  const activeIssuesForStudent = data?.getDueDates.filter(
    (issue: IssueResponse) => issue.userId === selectedStudent && issue.state.type !== 'RETURNED'
  ) || [];

  const issueOptions = activeIssuesForStudent.map((issue: IssueResponse) => {
    const book = booksData?.getAllBooks.find((b: Book) => b.id === issue.bookId);
    return {
      id: issue.id,
      name: book ? `${book.title} (Due: ${new Date(issue.dueDate).toLocaleDateString()})` : `Issue #${issue.id.substring(0, 8)}`
    };
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Librarian Hub</h1>
          <p className="text-gray-500 mt-1">Manage circulation, track assets, and handle student requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-tactile flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} />
            Export Logs
          </button>
          <button 
            onClick={() => navigate('/librarian/stock')}
            className="btn-tactile flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md"
          >
            <Plus size={18} />
            Add Stock
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Issues" 
          value={statsData?.getLibrarianStats.activeIssues.toString() || "0"} 
          delay="100ms" color="text-indigo-600 bg-indigo-600"
          icon={<BookOpen size={24} />} 
        />
        <StatCard 
          title="Overdue" 
          value={statsData?.getLibrarianStats.overdueIssues.toString() || "0"} 
          delay="200ms" color="text-rose-600 bg-rose-600"
          icon={<AlertCircle size={24} />} 
        />
        <StatCard 
          title="Returned (Today)" 
          value={statsData?.getLibrarianStats.returnedToday.toString() || "0"} 
          delay="300ms" color="text-emerald-600 bg-emerald-600"
          icon={<CheckCircle size={24} />} 
        />
        <StatCard 
          title="Reservations" 
          value={statsData?.getLibrarianStats.activeReservations.toString() || "0"} 
          delay="400ms" color="text-amber-600 bg-amber-600"
          icon={<Clock size={24} />} 
        />
      </div>

      {/* Main Content Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Quick Actions */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Circulation Desk</h3>
            <ActionCard 
              title="Issue Book" 
              description="Record a new book loan to a student" 
              icon={BookPlus} 
              color="indigo" 
              delay="500ms"
              onClick={() => setIsIssueModalOpen(true)}
            />
            <ActionCard 
              title="Confirm Return" 
              description="Process a returned book and update inventory" 
              icon={RefreshCcw} 
              color="emerald" 
              delay="600ms"
              onClick={() => setIsReturnModalOpen(true)}
            />
          </div>
          
          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 animate-slide-up opacity-0" style={{ animationDelay: '800ms' }}>
            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <History size={18} />
              Quick Tip
            </h4>
            <p className="text-indigo-700 text-sm leading-relaxed">
              Always verify the book condition before confirming a return to maintain accurate resource tracking.
            </p>
          </div>
        </div>

        {/* Right Column: Activity Logs */}
        <div 
          className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up opacity-0" 
          style={{ animationDelay: '700ms' }}
        >
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <History size={18} className="text-indigo-600" />
              Recent Circulation
            </h3>
            <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              Live Log
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                      Loading circulation data...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-rose-500 italic">
                      Failed to load activity log.
                    </td>
                  </tr>
                ) : data?.getDueDates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                      No recent activity found.
                    </td>
                  </tr>
                ) : (
                  data?.getDueDates.map((issue: IssueResponse) => {
                    const book = booksData?.getAllBooks.find((b: Book) => b.id === issue.bookId);
                    const student = studentsData?.getStudentList.find((s: User) => s.id === issue.userId);
                    return (
                      <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{book?.title || `Book #${issue.bookId}`}</div>
                          <div className="text-xs text-gray-400">ID: {issue.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student?.fullName || `User #${issue.userId}`}
                        </td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          issue.state.type === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' : 
                          issue.state.type === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {issue.state.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue New Book"
        subtitle="Create a new lending record for a student"
      >
        <div className="space-y-6">
          <CustomSelect 
            label="Select Student"
            options={studentOptions}
            value={selectedStudent}
            onChange={setSelectedStudent}
            placeholder="Search for a student..."
          />
          <CustomSelect 
            label="Select Book"
            options={bookOptions}
            value={selectedBook}
            onChange={setSelectedBook}
            placeholder="Search for a book..."
          />
          <button 
            onClick={handleIssue}
            disabled={!selectedStudent || !selectedBook}
            className="btn-tactile w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all mt-4"
          >
            Issue Book
          </button>
        </div>
      </Modal>

      {/* Confirm Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Confirm Return"
        subtitle="Process a book return and clear the active issue"
      >
        <div className="space-y-6">
          <CustomSelect 
            label="Select Student"
            options={studentOptions}
            value={selectedStudent}
            onChange={(val) => {
              setSelectedStudent(val);
              setSelectedIssueId('');
            }}
            placeholder="Search for a student..."
          />
          <CustomSelect 
            label="Active Issue"
            options={issueOptions}
            value={selectedIssueId}
            onChange={setSelectedIssueId}
            placeholder={selectedStudent ? "Select an active loan..." : "Select a student first"}
          />
          <button 
            onClick={handleReturn}
            disabled={!selectedStudent || !selectedIssueId}
            className="btn-tactile w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none transition-all mt-4"
          >
            Confirm Return
          </button>
        </div>
      </Modal>
    </div>
  );
};

