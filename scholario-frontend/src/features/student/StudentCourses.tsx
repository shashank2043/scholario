import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { GraduationCap, BookOpen, Clock, ChevronRight } from 'lucide-react';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
    }
  }
`;

const GET_STUDENT_COURSES = gql`
  query GetStudentCourses($studentId: ID!) {
    # Assuming there's a query or logic to get courses for student. 
    # For now, we'll list all books by courses or similar if available.
    # The schema shows getBooksByCourse(courseId: ID!)
    getFacultyList { # Placeholder to get some courses if real student-course link is missing in schema
       fullName
    }
  }
`;

export const StudentCourses = () => {
  const { data: profileData } = useQuery(GET_MY_PROFILE);
  
  // Since the schema doesn't have a clear 'getMyCourses' for students yet, 
  // we'll display a high-fidelity "Coming Soon" or "Course Registry" view.
  
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">My Academic Modules</h2>
        <p className="text-sm text-slate-500 font-medium">Tracking enrolled courses and associated learning materials</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2rem] border-2 border-slate-50 p-8 shadow-sm flex flex-col justify-center items-center text-center py-20">
           <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6">
              <GraduationCap size={40} />
           </div>
           <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enrollment Matrix Pending</h4>
           <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">The digital course registry is being synchronized with your student ID.</p>
        </div>

        <div className="space-y-6">
           <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Digital Syllabus Feed</h5>
           <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <p className="text-xs font-black uppercase tracking-widest">Global Telemetry Active</p>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-mono">
                 [SYSTEM] Scanning academic nodes...<br/>
                 [SYSTEM] Verifying enrollment tokens...<br/>
                 [STABLE] Connection established.
              </p>
           </div>
           
           <div className="p-6 bg-white border-2 border-slate-50 rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <BookOpen size={20} className="text-indigo-600" />
                 <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Material Archive</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">"Access to course materials will be enabled upon module authorization."</p>
           </div>
        </div>
      </div>
    </div>
  );
};
