import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { GraduationCap, Plus, BookOpen, Trash2, Search, Link as LinkIcon, AlertCircle } from 'lucide-react';
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

const GET_COURSES_BY_FACULTY = gql`
  query GetCoursesByFaculty($facultyId: ID!) {
    getCoursesByFaculty(facultyId: $facultyId) {
      id
      courseCode
      title
      description
    }
  }
`;

const GET_ALL_BOOKS = gql`
  query GetAllBooks {
    getAllBooks {
      id
      title
      isbn
    }
  }
`;

const GET_BOOKS_BY_COURSE = gql`
  query GetBooksByCourse($courseId: ID!) {
    getBooksByCourse(courseId: $courseId) {
      id
      title
      isbn
    }
  }
`;

const CREATE_COURSE = gql`
  mutation CreateCourse($input: CourseInput!) {
    createCourse(input: $input) {
      id
      courseCode
      title
    }
  }
`;

const ASSIGN_BOOK_TO_COURSE = gql`
  mutation AssignBookToCourse($input: CourseMaterialInput!) {
    assignBookToCourse(input: $input) {
      id
      bookId
      courseId
    }
  }
`;

export const CourseManagement = () => {
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Form states for new course
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  // Form states for assigning book
  const [selectedBookId, setSelectedBookId] = useState('');

  const { data: profileData } = useQuery(GET_MY_PROFILE);
  const facultyId = profileData?.getMyProfile?.id;

  const { data: coursesData, loading: coursesLoading, refetch: refetchCourses } = useQuery(GET_COURSES_BY_FACULTY, {
    variables: { facultyId },
    skip: !facultyId
  });

  const { data: booksData } = useQuery(GET_ALL_BOOKS);

  const [createCourse] = useMutation(CREATE_COURSE);
  const [assignBook] = useMutation(ASSIGN_BOOK_TO_COURSE);

  const handleCreateCourse = async () => {
    if (!courseCode || !courseTitle) return;
    try {
      await createCourse({
        variables: {
          input: {
            courseCode,
            title: courseTitle,
            description: courseDesc,
            facultyId
          }
        }
      });
      setIsCourseModalOpen(false);
      setCourseCode('');
      setCourseTitle('');
      setCourseDesc('');
      refetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignBook = async () => {
    if (!selectedCourseId || !selectedBookId) return;
    try {
      await assignBook({
        variables: {
          input: {
            courseId: selectedCourseId,
            bookId: selectedBookId,
            mandatory: true
          }
        }
      });
      setIsAssignModalOpen(false);
      setSelectedBookId('');
      // In a real app we'd refetch course materials or similar
      alert('Book assigned to course successfully');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Academic Courses</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your courses and learning materials</p>
        </div>
        <button 
          onClick={() => setIsCourseModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={16} />
          <span>Initialize Course</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesLoading ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Course Registry...</div>
        ) : coursesData?.getCoursesByFaculty.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
             <GraduationCap size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active courses registered</p>
          </div>
        ) : coursesData?.getCoursesByFaculty.map((course: any) => (
          <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-all group">
            <div className="p-6 space-y-4 flex-1">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded uppercase tracking-tighter">
                  {course.courseCode}
                </span>
                <button className="text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{course.title}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed font-medium">{course.description || 'No description provided.'}</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center space-x-1.5">
                <BookOpen size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Materials</span>
              </div>
              <button 
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setIsAssignModalOpen(true);
                }}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center hover:underline"
              >
                <LinkIcon size={12} className="mr-1" /> Assign Book
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      <Modal 
        isOpen={isCourseModalOpen} 
        onClose={() => setIsCourseModalOpen(false)} 
        title="Initialize Course" 
        subtitle="Provision a new academic module in the global registry"
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Code</label>
            <input 
              type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-sm uppercase"
              placeholder="e.g. CS101"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Title</label>
            <input 
              type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
              placeholder="e.g. Introduction to Neural Networks"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
            <textarea 
              value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm h-32 resize-none"
              placeholder="Module objectives and coverage..."
            />
          </div>
          <button 
            onClick={handleCreateCourse}
            disabled={!courseCode || !courseTitle}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200 disabled:opacity-50 mt-2"
          >
            Finalize Module Registry
          </button>
        </div>
      </Modal>

      {/* Assign Book Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        title="Link Materials" 
        subtitle="Associate published books with this course module"
      >
        <div className="space-y-6">
          <CustomSelect 
            label="Target Resource"
            options={booksData?.getAllBooks.map((b: any) => ({ id: b.id, name: `${b.title} (ISBN: ${b.isbn})` })) || []}
            value={selectedBookId}
            onChange={setSelectedBookId}
            placeholder="Search published books..."
          />
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3">
             <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[11px] text-amber-700 font-medium leading-relaxed uppercase tracking-tight">
               Only published and validated resources should be assigned to active courses.
             </p>
          </div>
          <button 
            onClick={handleAssignBook}
            disabled={!selectedBookId}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            Authorize Material Link
          </button>
        </div>
      </Modal>
    </div>
  );
};
