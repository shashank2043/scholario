import { ProfileManager } from '../shared/ProfileManager';

export const LibrarianSettings = () => {
  return (
    <div className="space-y-8 animate-slide-up">
      <header>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Librarian Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Configure library operations and staff preferences.</p>
      </header>

      <ProfileManager />
    </div>
  );
};
