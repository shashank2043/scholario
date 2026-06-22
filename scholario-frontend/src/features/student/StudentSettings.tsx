import { ProfileManager } from '../shared/ProfileManager';

export const StudentSettings = () => {
  return (
    <div className="space-y-8 animate-slide-up">
      <header>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Student Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Personalize your library experience and account details.</p>
      </header>

      <ProfileManager />
    </div>
  );
};
