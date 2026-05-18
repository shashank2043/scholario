import { useState } from 'react';
import { gql } from '@apollo/client';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { Search, Book, Bookmark, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/Modal';

const SEARCH_BOOKS = gql`
  query SearchBooks($title: String, $isbn: String) {
    searchBooks(title: $title, isbn: $isbn) {
      id
      title
      isbn
      description
      state {
        type
      }
    }
  }
`;

const RESERVE_BOOK = gql`
  mutation ReserveBook($bookId: ID!) {
    reserveBook(bookId: $bookId) {
      id
      status
      reservedAt
    }
  }
`;

export const StudentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  
  const [searchBooks, { data, loading }] = useLazyQuery(SEARCH_BOOKS);
  const [reserveBook, { loading: reserving }] = useMutation(RESERVE_BOOK);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchBooks({ variables: { title: searchTerm } });
    }
  };

  const handleReserve = async (bookId: string) => {
    try {
      await reserveBook({ variables: { bookId } });
      alert('Book reserved successfully!');
      setSelectedBook(null);
    } catch (err) {
      console.error(err);
      alert('Failed to reserve book.');
    }
  };

  const books = data?.searchBooks || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Global Library Search</h2>
        <p className="text-sm text-slate-500 font-medium">Discover academic resources and reserve them for study</p>
      </header>

      <div className="max-w-3xl">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, ISBN, or keywords..."
            className="w-full pl-14 pr-32 py-5 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 outline-none text-lg font-medium shadow-sm transition-all"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 px-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Explore'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Accessing Global Registry...</div>
        ) : books.length === 0 && searchTerm ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
             <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching resources found</p>
          </div>
        ) : books.map((book: any) => (
          <div key={book.id} className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm p-6 hover:border-indigo-100 transition-all group flex flex-col">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
              <Book size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-tight flex-1">{book.title}</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">ISBN: {book.isbn}</p>
            
            <div className="mt-6 flex items-center justify-between gap-3">
               <button 
                 onClick={() => setSelectedBook(book)}
                 className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
               >
                 View Details
               </button>
               <button 
                 onClick={() => handleReserve(book.id)}
                 disabled={book.state.type !== 'PUBLISHED' || reserving}
                 className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
               >
                 <Bookmark size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title="Resource Forensics"
        subtitle="Detailed publication data and availability status"
      >
        {selectedBook && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <h5 className="font-black text-slate-900 uppercase tracking-tight text-xl mb-2">{selectedBook.title}</h5>
               <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedBook.description || 'No digital abstract available for this resource.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${selectedBook.state.type === 'PUBLISHED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                     <p className="text-xs font-black text-slate-900 uppercase">{selectedBook.state.type}</p>
                  </div>
               </div>
               <div className="p-4 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Code</p>
                  <p className="text-xs font-bold text-slate-900 font-mono">{selectedBook.isbn}</p>
               </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl text-white">
               <div className="flex items-center gap-2 mb-4 text-indigo-400">
                  <CheckCircle size={18} />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Acquisition Protocol</h4>
               </div>
               <button 
                 onClick={() => handleReserve(selectedBook.id)}
                 disabled={selectedBook.state.type !== 'PUBLISHED' || reserving}
                 className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
               >
                 {reserving ? 'Processing...' : 'Reserve for Collection'}
               </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
