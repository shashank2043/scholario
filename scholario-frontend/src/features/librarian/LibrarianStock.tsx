import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Package, Plus, Search, Trash2, Edit3, BookOpen, Loader2, AlertTriangle, Filter, Hash } from 'lucide-react';
import { Modal } from '../../components/Modal';

const GET_ALL_BOOKS = gql`
  query GetAllBooks {
    getAllBooks {
      id
      title
      isbn
      facultyId
      state {
        type
      }
      versionNumber
      updatedAt
    }
  }
`;

const CREATE_BOOK = gql`
  mutation CreateBook($input: BookInput!) {
    createBook(input: $input) {
      id
      title
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id) {
      id
    }
  }
`;

interface Book {
  id: string;
  title: string;
  isbn: string;
  facultyId: string;
  state: {
    type: string;
  };
  versionNumber: number;
  updatedAt: string;
}

export const LibrarianStock = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBook, setNewBook] = useState({ title: '', isbn: '', desc: '' });

  const { data, loading, error } = useQuery<{ getAllBooks: Book[] }>(GET_ALL_BOOKS);
  const [createBook, { loading: creating }] = useMutation(CREATE_BOOK);
  const [deleteBook] = useMutation(DELETE_BOOK);

  const handleCreate = async () => {
    if (!newBook.title || !newBook.isbn) return;
    try {
      await createBook({
        variables: { input: { title: newBook.title, isbn: newBook.isbn, description: newBook.desc } },
        refetchQueries: [{ query: GET_ALL_BOOKS }]
      });
      setIsModalOpen(false);
      setNewBook({ title: '', isbn: '', desc: '' });
    } catch (err) {
      console.error('Stock addition failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Execute PERMANENT_DELETION on this asset node?')) return;
    try {
      await deleteBook({ variables: { id }, refetchQueries: [{ query: GET_ALL_BOOKS }] });
    } catch (err) {
      console.error('Asset deletion failed:', err);
    }
  };

  const filteredBooks = data?.getAllBooks?.filter((b: Book) => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.isbn.includes(searchTerm)
  );

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <Loader2 className="animate-spin text-emerald-600" size={32} />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Inventory Registry...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Global Asset Inventory</h3>
          <p className="text-xs text-slate-500 font-medium font-mono uppercase mt-1">Librarian Node // Registry Oversight</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all btn-tactile shadow-lg shadow-emerald-100"
        >
          <Plus size={16} />
          <span>Add New Stock</span>
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by Title or ISBN..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:border-emerald-500 outline-none transition-all font-medium text-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
        <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 flex items-center space-x-2 hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Advanced Filters</span>
        </button>
      </div>

      {error ? (
        <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 flex items-center space-x-4">
          <AlertTriangle size={24} />
          <div>
            <p className="font-black uppercase tracking-tighter text-sm">Registry Sync Error</p>
            <p className="text-xs font-medium opacity-80">Unable to establish connection to inventory nodes.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Version</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Update</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBooks?.map((book: Book) => (
                <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-100 p-3 rounded-xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{book.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ISBN: {book.isbn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      book.state?.type === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      book.state?.type === 'ARCHIVED' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {book.state?.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center text-xs font-mono font-bold text-slate-500">
                    v{book.versionNumber}
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                    {new Date(book.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBooks?.length === 0 && (
             <div className="p-20 text-center space-y-4">
                <Package className="text-slate-200 mx-auto" size={48} />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching assets found in global inventory</p>
             </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ingest New Asset"
        subtitle="Finalize asset parameters for global registry ingestion"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Title</label>
            <input 
              type="text" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold transition-all text-sm"
              placeholder="e.g. Modern Database Internals"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Standard Identifier (ISBN)</label>
            <div className="relative">
              <input 
                type="text" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-mono font-bold transition-all text-sm"
                placeholder="978-XXXXXXXXXX"
              />
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Registry Metadata</label>
            <textarea 
              value={newBook.desc} onChange={(e) => setNewBook({ ...newBook, desc: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-medium transition-all text-sm min-h-[100px] resize-none"
              placeholder="Provide ingestion summary..."
            />
          </div>
          <button 
            onClick={handleCreate}
            disabled={creating || !newBook.title || !newBook.isbn}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs btn-tactile disabled:opacity-50 mt-4 flex items-center justify-center space-x-2"
          >
            {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            <span>Execute Ingestion</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};
