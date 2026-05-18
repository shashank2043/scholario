import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Package, Search, Plus, Filter, MoreVertical, Book, AlertTriangle } from 'lucide-react';
import { Modal } from '../../components/Modal';

const GET_ALL_BOOKS = gql`
  query GetAllBooks {
    getAllBooks {
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

const CREATE_BOOK = gql`
  mutation CreateBook($input: BookInput!) {
    createBook(input: $input) {
      id
      title
      isbn
    }
  }
`;

export const LibrarianStock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');

  const { data, loading, refetch } = useQuery(GET_ALL_BOOKS);
  const [createBook, { loading: creating }] = useMutation(CREATE_BOOK);

  const handleAddStock = async () => {
    if (!title || !isbn) return;
    try {
      await createBook({
        variables: {
          input: { title, isbn, description }
        }
      });
      setIsStockModalOpen(false);
      setTitle('');
      setIsbn('');
      setDescription('');
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const books = data?.getAllBooks || [];
  const filteredBooks = books.filter((b: any) => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Inventory Matrix</h2>
          <p className="text-sm text-slate-500 font-medium">Global academic resource stock management</p>
        </div>
        <button 
          onClick={() => setIsStockModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
          <Plus size={16} />
          <span>Add New Stock</span>
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search inventory by title or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium shadow-sm transition-all"
          />
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <Filter size={16} />
          <span>Sort Registry</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Resource Entity</th>
              <th className="px-6 py-4">Registry ISBN</th>
              <th className="px-6 py-4">Deployment Status</th>
              <th className="px-6 py-4">On-Boarding Date</th>
              <th className="px-6 py-4 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase animate-pulse">Scanning Inventory Nodes...</td></tr>
            ) : filteredBooks.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No stock found in registry</td></tr>
            ) : filteredBooks.map((book: any) => (
              <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <Book size={16} />
                     </div>
                     <p className="font-bold text-slate-900 text-sm tracking-tight">{book.title}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">{book.isbn}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase ${
                    book.state.type === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {book.state.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-[10px] text-slate-500 uppercase">
                  {new Date(book.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
        title="Provision New Stock" 
        subtitle="Manually board a new physical resource into the digital registry"
      >
        <div className="space-y-5">
           <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publication Title</label>
            <input 
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
              placeholder="e.g. Modern Operating Systems"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry ISBN</label>
            <input 
              type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-sm"
              placeholder="978-..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Notes</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm h-32 resize-none"
              placeholder="Condition, shelf location, or acquisition details..."
            />
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3">
             <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[11px] text-amber-700 font-medium leading-relaxed uppercase tracking-tight">
               Manually added stock defaults to DRAFT status and requires validation before global circulation.
             </p>
          </div>

          <button 
            onClick={handleAddStock}
            disabled={!title || !isbn || creating}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            {creating ? 'Syncing...' : 'Initialize Stock Boarding'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
