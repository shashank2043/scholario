import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
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
  const [issueMutation] = useMutation(ISSUE_BOOK);
  const [returnMutation] = useMutation(RETURN_BOOK);

  // Note: These handlers will be used by modals in a later task
  // Keeping them here as placeholders for now to satisfy mutation logic requirement
  const handleIssue = async (bookId: string, userId: string) => {
    try {
      await issueMutation({ variables: { bookId, userId } });
      alert('Book issued successfully!');
    } catch (err) {
      alert('Failed to issue book');
    }
  };

  const handleReturn = async (issueId: string, userId: string) => {
    try {
      await returnMutation({ variables: { issueId, userId } });
      alert('Book returned successfully!');
    } catch (err) {
      alert('Failed to return book');
    }
  };

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
          <button className="btn-tactile flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md">
            <Plus size={18} />
            Add Stock
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Issues" value="142" delay="100ms" color="text-indigo-600 bg-indigo-600"
          icon={<BookOpen size={24} />} 
        />
        <StatCard 
          title="Overdue" value="12" delay="200ms" color="text-rose-600 bg-rose-600"
          icon={<AlertCircle size={24} />} 
        />
        <StatCard 
          title="Returned (Today)" value="24" delay="300ms" color="text-emerald-600 bg-emerald-600"
          icon={<CheckCircle size={24} />} 
        />
        <StatCard 
          title="Reservations" value="8" delay="400ms" color="text-amber-600 bg-amber-600"
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
              onClick={() => {}} // Modal will be added later
            />
            <ActionCard 
              title="Confirm Return" 
              description="Process a returned book and update inventory" 
              icon={RefreshCcw} 
              color="emerald" 
              delay="600ms"
              onClick={() => {}} // Modal will be added later
            />
          </div>
          
          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 animate-slide-up opacity-0" style={{ animationDelay: '700ms' }}>
            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <History size={18} />
              Quick Tip
            </h4>
            <p className="text-indigo-700 text-sm leading-relaxed">
              Always verify the book condition before confirming a return to maintain accurate resource tracking.
            </p>
          </div>
        </div>

        {/* Right Column: Placeholder for Logs/Activity */}
        <div className="lg:col-span-2 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 min-h-[400px] flex items-center justify-center animate-slide-up opacity-0" style={{ animationDelay: '800ms' }}>
          <div className="text-center p-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <History size={32} />
            </div>
            <h4 className="text-gray-900 font-bold text-lg mb-1">Activity Log Coming Soon</h4>
            <p className="text-gray-500 max-w-xs mx-auto">This area will display real-time circulation updates and pending reservation requests.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

