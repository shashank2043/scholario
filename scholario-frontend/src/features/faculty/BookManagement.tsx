import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Plus, Search, Filter, Send, CheckCircle, Archive, MoreVertical, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';
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

const GET_FACULTY_LIST = gql`
  query GetFacultyList {
    getFacultyList {
      id
      fullName
      username
    }
  }
`;

const SUBMIT_FOR_REVIEW = gql`
  mutation SubmitForReview($bookId: ID!, $reviewerId: ID) {
    submitBookForReview(bookId: $bookId, reviewerId: $reviewerId) {
      id
      status
    }
  }
`;

const PUBLISH_BOOK = gql`
  mutation PublishBook($id: ID!) {
    publishBook(id: $id) {
      id
      state {
        type
      }
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

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    getDepartments {
      id
      name
    }
  }
`;

export const BookManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState("");

  // Create Book Form States
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: profileData } = useQuery(GET_MY_PROFILE);
  const facultyId = profileData?.getMyProfile?.id;

  const { data: booksData, loading: booksLoading, refetch: refetchBooks } = useQuery(GET_BOOKS_BY_FACULTY, {
    variables: { facultyId },
    skip: !facultyId
  });

  const { data: facultyListData } = useQuery(GET_FACULTY_LIST);
  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS);

  const [submitForReview] = useMutation(SUBMIT_FOR_REVIEW);
  const [publishBook] = useMutation(PUBLISH_BOOK);
  const [createBook] = useMutation(CREATE_BOOK);

  const handleReviewSubmit = async () => {
    if (!selectedBook || !selectedReviewer) return;
    try {
      await submitForReview({
        variables: {
          bookId: selectedBook.id,
          reviewerId: selectedReviewer
        }
      });
      setIsReviewModalOpen(false);
      setSelectedBook(null);
      setSelectedReviewer("");
      refetchBooks();
      alert('Publication submitted for peer review');
    } catch (err) {
      console.error('Error submitting for review:', err);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createBook({
        variables: {
          input: { title, isbn, description }
        }
      });
      setIsCreateModalOpen(false);
      setTitle('');
      setIsbn('');
      setDescription('');
      refetchBooks();
      alert('New resource drafted successfully');
    } catch (err) {
      console.error('Error creating book:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (bookId: string) => {
    try {
      await publishBook({ variables: { id: bookId } });
      refetchBooks();
      alert('Publication finalized and published globally');
    } catch (err) {
      console.error(err);
    }
  };

  const books = booksData?.getBooksByFaculty || [];
  const filteredBooks = books.filter((book: any) => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (type: string) => {
    switch (type) {
      case 'PUBLISHED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'REVIEW': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'DRAFT': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'ARCHIVED': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Publication Engine</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your authored academic resources and review cycles</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Plus size={16} />
          <span>Draft New Resource</span>
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search registry by title or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium shadow-sm transition-all"
          />
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <Filter size={16} />
          <span>Filter Registry</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Publication Entity</th>
              <th className="px-6 py-4">Registry ISBN</th>
              <th className="px-6 py-4">Operational Status</th>
              <th className="px-6 py-4">Creation Date</th>
              <th className="px-6 py-4 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {booksLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase animate-pulse">Synchronizing Publication Data...</td></tr>
            ) : filteredBooks.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No matching resources in registry</td></tr>
            ) : filteredBooks.map((book: any) => (
              <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 text-sm tracking-tight">{book.title}</p>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">{book.isbn}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase ${getStatusStyle(book.state.type)}`}>
                    {book.state.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-[10px] text-slate-500 uppercase">
                  {new Date(book.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    {book.state.type === 'DRAFT' && (
                      <button 
                        onClick={() => {
                          setSelectedBook(book);
                          setIsReviewModalOpen(true);
                        }}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors title='Submit for Review'"
                      >
                        <Send size={14} />
                      </button>
                    )}
                    {book.state.type === 'REVIEW' && (
                      <button 
                        onClick={() => handlePublish(book.id)}
                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        title="Finalize Publication"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        title="Peer Review Submission" 
        subtitle="Initiate the authorization cycle for this publication"
      >
        <div className="space-y-6">
           <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Entity</p>
              <p className="text-sm font-bold text-slate-900">{selectedBook?.title}</p>
           </div>
           
           <CustomSelect 
             label="Assigned Reviewer"
             options={facultyListData?.getFacultyList
               .filter((f: any) => f.id !== facultyId)
               .map((f: any) => ({ id: f.id, name: `${f.fullName} (@${f.username})` })) || []}
             value={selectedReviewer}
             onChange={setSelectedReviewer}
             placeholder="Select peer reviewer..."
           />

           <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start space-x-3">
              <ExternalLink size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-700 font-medium leading-relaxed uppercase tracking-tight">
                Peer review is a mandatory protocol. Reviewers will be notified of your submission via global telemetry.
              </p>
           </div>

           <button 
             onClick={handleReviewSubmit}
             disabled={!selectedReviewer}
             className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200 disabled:opacity-50"
           >
             Finalize Review Request
           </button>
        </div>
      </Modal>
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
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
