import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      fullName
    }
  }
`;

const GET_BOOKS_BY_FACULTY = gql`
  query GetBooksByFaculty($facultyId: ID!) {
    getBooksByFaculty(facultyId: $facultyId) {
      id
      title
      isbn
      state {
        type
      }
      createdAt
    }
  }
`;

interface Book {
  id: string;
  title: string;
  isbn: string;
  state: {
    type: string;
  };
  createdAt: string;
}

interface FacultyBooksData {
  getBooksByFaculty: Book[];
}

interface ProfileData {
  getMyProfile: {
    id: string;
    fullName: string;
  };
}

export const BookManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: profileData, loading: profileLoading, error: profileError } = useQuery<ProfileData>(GET_MY_PROFILE);

  const { data: booksData, loading: booksLoading, error: booksError } = useQuery<FacultyBooksData>(GET_BOOKS_BY_FACULTY, {
    variables: { facultyId: profileData?.getMyProfile?.id },
    skip: !profileData?.getMyProfile?.id
  });

  const loading = profileLoading || booksLoading;
  const error = profileError || booksError;
  const books = booksData?.getBooksByFaculty || [];

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">My Books</h3>
          <p className="text-gray-500">Manage your authored publications and review status.</p>
        </div>
        <button className="btn-tactile flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={20} />
          <span>New Book</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search your books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="btn-tactile flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">ISBN</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Created At</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading books...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-red-500">Error loading books</td></tr>
            ) : filteredBooks.map((book: any) => (
              <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{book.title}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{book.isbn}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    book.state.type === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                    book.state.type === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {book.state.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(book.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="btn-tactile text-indigo-600 hover:text-indigo-800 font-medium text-sm">Edit</button>
                </td>
              </tr>
            ))}
            {!loading && filteredBooks.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No books found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
