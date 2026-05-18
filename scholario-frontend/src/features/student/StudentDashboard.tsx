import { gql } from '@apollo/client';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { useState } from 'react';
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

const SEARCH_BOOKS = gql`
  query SearchBooks($title: String) {
    searchBooks(title: $title) {
      id
      title
      isbn
    }
  }
`;

interface SearchBooksData {
  searchBooks: {
    id: string;
    title: string;
    isbn: string;
  }[];
}

export const StudentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useQuery<MyIssuesData>(GET_MY_ISSUES);
  
  const [searchBooks, { data: searchData, loading: searching }] = useLazyQuery<SearchBooksData>(SEARCH_BOOKS);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchBooks({ variables: { title: searchTerm } });
    }
  };

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
    <div className="space-y-8 pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">My Library Activity</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage your academic resources and tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-tactile flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm">
            <History size={16} />
            History
          </button>
          <button className="btn-tactile flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">
            <Search size={16} />
            Find Books
          </button>
        </div>
      </div>

      {/* Stats Grid - Staggered */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            style={{ animationDelay: stat.delay }}
            className="animate-slide-up opacity-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all group"
          >
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Currently Borrowed</h4>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                {booksHeld} Units
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
              ) : data?.getMyIssuedBooks.map((issue: any, index: number) => {
                const dueDate = new Date(issue.dueDate);
                const now = new Date();
                const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                const isOverdue = issue.state.type === 'OVERDUE';
                const isDueSoon = diffDays <= 3 && diffDays >= 0;

                return (
                  <div 
                    key={issue.id} 
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all group animate-slide-up opacity-0"
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white border border-slate-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <Book size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Resource ID: {issue.bookId}</p>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-0.5">REF: {issue.id.substring(0, 8)}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            isDueSoon ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            <Clock size={10} />
                            {isOverdue ? 'Overdue' : isDueSoon ? `Due in ${diffDays}d` : 'Secured'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Due {dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn-tactile px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Renew</button>
                      <button className="btn-tactile px-3 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors">Details</button>
                    </div>
                  </div>
                );
              })}
              {!loading && !error && data?.getMyIssuedBooks.length === 0 && (
                <div className="p-12 text-center text-gray-400 italic text-sm">
                  No active loans found.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 text-white animate-slide-up opacity-0" style={{ animationDelay: '700ms' }}>
            <h4 className="text-lg font-bold mb-4 uppercase tracking-tight">Quick Discovery</h4>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Find academic resource..." 
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 outline-none placeholder:text-indigo-200 text-sm font-medium"
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={searching}
                className="btn-tactile w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50"
              >
                {searching ? 'Syncing...' : 'Execute Search'}
              </button>

              {searchData?.searchBooks && (
                <div className="mt-4 space-y-2 animate-fade-in border-t border-white/10 pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Registry Matches</p>
                  {searchData.searchBooks.slice(0, 3).map((book: any) => (
                    <div key={book.id} className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group">
                      <div className="truncate pr-2">
                        <p className="text-[11px] font-bold truncate">{book.title}</p>
                        <p className="text-[9px] text-indigo-300 font-mono uppercase">{book.isbn}</p>
                      </div>
                      <button className="px-2 py-1 bg-white text-indigo-600 text-[9px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">Hold</button>
                    </div>
                  ))}
                  {searchData.searchBooks.length === 0 && (
                    <p className="text-[10px] text-indigo-200 italic">No nodes matched criteria.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card-tactile group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-all cursor-pointer animate-slide-up opacity-0" style={{ animationDelay: '800ms' }}>
             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all mb-4">
                <AlertCircle size={20} />
             </div>
             <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Payments & Dues</h4>
             <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">Clear pending liabilities and view archival transaction history.</p>
             <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Balance</span>
                <span className="text-lg font-black text-slate-900">${totalFines.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

