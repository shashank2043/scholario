import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Book, Clock, AlertCircle, History, Search, Bookmark } from 'lucide-react';

const GET_MY_ISSUES = gql`
  query GetMyIssues {
    getMyIssuedBooks {
      id
      bookId
      issueDate
      dueDate
      state {
        type
      }
      penaltyAmount
    }
  }
`;

interface Issue {
  id: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
  state: {
    type: string;
  };
  penaltyAmount: number;
}

interface MyIssuesData {
  getMyIssuedBooks: Issue[];
}

export const StudentDashboard = () => {
  const { data, loading, error } = useQuery<MyIssuesData>(GET_MY_ISSUES);

  const booksHeld = data?.getMyIssuedBooks.length || 0;
  
  const dueSoon = data?.getMyIssuedBooks.filter(issue => {
    const dueDate = new Date(issue.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length || 0;

  const totalFines = data?.getMyIssuedBooks.reduce((acc, issue) => acc + (issue.penaltyAmount || 0), 0) || 0;
  const reservations = 0; // Planned feature

  const stats = [
    { label: 'Books Held', value: booksHeld, icon: Book, color: 'text-indigo-600', bg: 'bg-indigo-50', delay: '100ms' },
    { label: 'Due Soon', value: dueSoon, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', delay: '200ms' },
    { label: 'Total Fines', value: `$${totalFines}`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', delay: '300ms' },
    { label: 'Reservations', value: reservations, icon: Bookmark, color: 'text-emerald-600', bg: 'bg-emerald-50', delay: '400ms' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-slide-up">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Library Activity</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your academic resources and tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-tactile flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm">
            <History size={20} />
            Borrow History
          </button>
          <button className="btn-tactile flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-2xl font-bold text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            <Search size={20} />
            Search Books
          </button>
        </div>
      </div>

      {/* Stats Grid - Staggered */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            style={{ animationDelay: stat.delay }}
            className="animate-slide-up opacity-0 bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm hover:shadow-xl hover:border-indigo-50 transition-all group"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
            <p className="text-4xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border-2 border-gray-50 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h4 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Currently Borrowed</h4>
              <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-black">
                {booksHeld} Books
              </span>
            </div>
            
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading your books...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
                  <p className="text-rose-500 font-bold">Error loading library data</p>
                </div>
              ) : data?.getMyIssuedBooks.length === 0 ? (
                <div className="p-12 text-center">
                  <Book size={40} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No books currently issued.</p>
                </div>
              ) : data?.getMyIssuedBooks.map((issue: any) => (
                <div key={issue.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gray-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <Book size={28} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Book ID: {issue.bookId}</p>
                      <p className="text-gray-500 font-medium flex items-center mt-1">
                        <Clock size={16} className="mr-2 text-indigo-400" /> Due on {new Date(issue.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest ${
                      issue.state.type === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>{issue.state.type}</span>
                    {issue.penaltyAmount > 0 && (
                      <p className="text-rose-600 font-black mt-2 flex items-center justify-end">
                        <AlertCircle size={14} className="mr-1" /> ${issue.penaltyAmount}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] shadow-xl text-white">
            <h4 className="text-xl font-bold mb-6">Quick Discovery</h4>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Find your next read..." 
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/50 outline-none placeholder:text-indigo-200 text-white font-medium"
                />
              </div>
              <button className="btn-tactile w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
                Search Library
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

