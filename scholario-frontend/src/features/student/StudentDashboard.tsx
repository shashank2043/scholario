import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Book, Clock, AlertCircle } from 'lucide-react';

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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800">My Library Activity</h3>
        <p className="text-gray-500">Track your borrowed books, upcoming deadlines, and recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-bold text-gray-800">Currently Borrowed</h4>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                {data?.getMyIssuedBooks.length || 0} Books
              </span>
            </div>
            
            <div className="divide-y divide-gray-50">
              {loading ? (
                <p className="p-8 text-center text-gray-500">Loading your books...</p>
              ) : error ? (
                <p className="p-8 text-center text-red-500">Error loading library data</p>
              ) : data?.getMyIssuedBooks.length === 0 ? (
                <p className="p-8 text-center text-gray-500">No books currently issued.</p>
              ) : data?.getMyIssuedBooks.map((issue: any) => (
                <div key={issue.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Book size={20} /></div>
                    <div>
                      <p className="font-medium text-gray-800">Book ID: {issue.bookId}</p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock size={14} className="mr-1" /> Due on {new Date(issue.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      issue.state.type === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>{issue.state.type}</span>
                    {issue.penaltyAmount > 0 && (
                      <p className="text-xs text-red-600 font-bold mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" /> Penalty: ${issue.penaltyAmount}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Quick Search</h4>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Find a book..." 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Search Library
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
