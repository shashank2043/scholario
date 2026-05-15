import { GraduationCap, Info } from 'lucide-react';

export const StudentCourses = () => {
  return (
    <div className="space-y-10 animate-slide-up">
      <header>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Academic Course Registry</h3>
        <p className="text-xs text-slate-500 font-medium font-mono uppercase mt-1">Student Node // Course Discovery Mode</p>
      </header>

      <div className="p-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] space-y-6">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <GraduationCap className="text-slate-300" size={48} />
        </div>
        <div className="max-w-md mx-auto">
          <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Enrollment System Synchronization</h4>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">
            The student enrollment node is currently being integrated with the global instructional registry. 
            Once synchronized, you will be able to discover and enroll in courses provisioned by faculty nodes.
          </p>
          <div className="mt-8 p-4 bg-indigo-50 rounded-2xl flex items-start space-x-3 text-left">
             <Info className="text-indigo-600 mt-0.5" size={16} />
             <p className="text-[10px] text-indigo-700 font-medium">
                Note: Individual course materials can still be accessed via the <strong className="uppercase">Library Discovery</strong> engine.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
