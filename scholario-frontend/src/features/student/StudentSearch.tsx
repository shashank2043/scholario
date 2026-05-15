import { useState } from 'react';
import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { Search, Book as BookIcon, Hash, Loader2, Bookmark, Info, ExternalLink } from 'lucide-react';

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

interface Book {
  id: string;
  title: string;
  isbn: string;
  description: string;
  state: {
    type: string;
  };
}

export const StudentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBooks, { data, loading, called }] = useLazyQuery<{ searchBooks: Book[] }>(SEARCH_BOOKS);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Simple logic: if it looks like an ISBN, search by ISBN
    const isIsbn = /^\d{10,13}$/.test(searchTerm.replace(/-/g, ''));
    searchBooks({
      variables: {
        title: isIsbn ? null : searchTerm,
        isbn: isIsbn ? searchTerm : null
      }
    });
  };

  return (
    <div className="space-y-10 animate-slide-up">
      <header className="max-w-2xl">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Library Discovery Engine</h3>
        <p className="text-xs text-slate-500 font-medium font-mono uppercase mt-1">Global Assets Registry // Access Level: Student</p>
      </header>

      {/* Search Bar */}
      <div className="max-w-3xl">
        <form onSubmit={handleSearch} className="relative group">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Title, Author, or ISBN..."
            className="w-full pl-14 pr-32 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-lg font-medium"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] btn-tactile disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Execute Search'}
          </button>
        </form>
        <div className="mt-4 flex items-center space-x-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Recent Queries:</span>
            <button onClick={() => setSearchTerm('Algorithms')} className="hover:text-indigo-600 transition-colors">Algorithms</button>
            <button onClick={() => setSearchTerm('Distributed Systems')} className="hover:text-indigo-600 transition-colors">Distributed Systems</button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {!called && !loading && (
          <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] space-y-4">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                <Bookmark className="text-slate-200" size={48} />
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enter parameters to begin discovery</p>
          </div>
        )}

        {loading && (
           <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scanning Federated Nodes...</p>
           </div>
        )}

        {called && !loading && data?.searchBooks?.length === 0 && (
           <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-slate-100 space-y-4">
              <Info className="text-slate-400 mx-auto" size={32} />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No matching assets found in registry</p>
           </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {data?.searchBooks?.map((book: Book) => (
            <div key={book.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-indigo-300 transition-all card-tactile">
              <div className="bg-slate-50 p-6 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors self-start md:self-center">
                <BookIcon size={32} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{book.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                    book.state?.type === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {book.state?.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center space-x-1"><Hash size={14} className="text-slate-300" /> <span>{book.isbn}</span></div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 max-w-2xl">{book.description || 'No digital summary available for this asset.'}</p>
              </div>
              <div className="flex md:flex-col gap-2">
                <button className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] btn-tactile">
                  Request Access
                </button>
                <button className="flex-1 md:flex-none px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2">
                   <ExternalLink size={12} />
                   <span>Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
