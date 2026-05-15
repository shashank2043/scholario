import { ProfileManager } from '../shared/ProfileManager';

export const FacultySettings = () => {
  return (
    <div className="space-y-8 animate-slide-up">
      <header>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Faculty Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and research profile.</p>
      </header>
      
      <ProfileManager />
    </div>
  );
};
