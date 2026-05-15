import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { BookOpen, Plus, GraduationCap, Clock, Info, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/Modal';

const GET_COURSES = gql`
  query GetCoursesByFaculty($facultyId: ID!) {
    getCoursesByFaculty(facultyId: $facultyId) {
      id
      courseCode
      title
      description
      createdAt
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

const GET_MY_ID = gql`
  query GetMyId {
    getMyProfile {
      id
    }
  }
`;

interface Course {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  createdAt: string;
}

export const FacultyCourses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseData, setCourseData] = useState({ code: '', title: '', desc: '' });

  const { data: profileData } = useQuery<{ getMyProfile: { id: string } }>(GET_MY_ID);
  const facultyId = profileData?.getMyProfile?.id;

  const { data, loading, error } = useQuery<{ getCoursesByFaculty: Course[] }>(GET_COURSES, {
    variables: { facultyId },
    skip: !facultyId
  });

  const [createCourse, { loading: creating }] = useMutation<{ createCourse: Course }>(CREATE_COURSE);

  const handleCreate = async () => {
    if (!courseData.code || !courseData.title) return;
    try {
      await createCourse({
        variables: {
          input: {
            courseCode: courseData.code,
            title: courseData.title,
            description: courseData.desc,
            facultyId: facultyId
          }
        },
        refetchQueries: [{ query: GET_COURSES, variables: { facultyId } }]
      });
      setIsModalOpen(false);
      setCourseData({ code: '', title: '', desc: '' });
    } catch (err) {
      console.error('Create course failed:', err);
    }
  };

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Course Registry...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Academic Course Load</h3>
          <p className="text-xs text-slate-500 font-medium font-mono uppercase mt-1">Faculty Node // Instructional Registry</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all btn-tactile shadow-lg shadow-indigo-100"
        >
          <Plus size={16} />
          <span>Provision Course</span>
        </button>
      </header>

      {error ? (
        <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 flex items-center space-x-4">
          <AlertCircle size={24} />
          <div>
            <p className="font-black uppercase tracking-tighter text-sm">Registry Sync Error</p>
            <p className="text-xs font-medium opacity-80">Unable to establish connection to instructional nodes.</p>
          </div>
        </div>
      ) : data?.getCoursesByFaculty?.length === 0 ? (
        <div className="p-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] space-y-4">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <GraduationCap className="text-slate-300" size={40} />
          </div>
          <div>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Registry Empty</h4>
            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">No courses are currently provisioned to your faculty node. Use the "Provision Course" protocol to begin.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.getCoursesByFaculty.map((course: Course) => (
            <div key={course.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all card-tactile group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <BookOpen size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">{course.courseCode}</span>
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-tighter text-lg mb-2">{course.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{course.description || 'No instructional metadata provided.'}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center text-slate-400 space-x-1">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Manage &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Provision Course Node"
        subtitle="Initialize a new academic course in the global registry"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Code</label>
                <input 
                  type="text" value={courseData.code} onChange={(e) => setCourseData({ ...courseData, code: e.target.value })}
                  placeholder="CS101"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-mono font-bold transition-all text-sm uppercase"
                />
             </div>
             <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Course Title</label>
                <input 
                  type="text" value={courseData.title} onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="Applied Algorithms"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm"
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Instructional Metadata</label>
            <textarea 
              value={courseData.desc} onChange={(e) => setCourseData({ ...courseData, desc: e.target.value })}
              placeholder="Provide a detailed overview of course objectives..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-medium transition-all text-sm min-h-[120px] resize-none"
            />
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl flex items-start space-x-3">
             <Info className="text-indigo-600 mt-0.5" size={16} />
             <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
                Course provisioning will broadcast this node to the student discovery registry and allow material assignment.
             </p>
          </div>

          <button 
            onClick={handleCreate}
            disabled={creating || !courseData.code || !courseData.title}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs btn-tactile disabled:opacity-50 mt-4 flex items-center justify-center space-x-2"
          >
            {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            <span>Finalize Provisioning</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};
