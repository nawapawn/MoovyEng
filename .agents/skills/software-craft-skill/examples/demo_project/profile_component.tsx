import React from "react";

/**
 * Synthetic Demo Profile Component (Deliberately Flawed for Demonstration)
 * Contains intentional synthetic patterns: unlabelled emoji button, removed outline, arbitrary CSS.
 */
export const DemoUserProfile = ({ user }: { user: { name: string; avatarUrl: string } }) => {
  return (
    <div className="p-[19px] bg-zinc-900 border border-zinc-800 rounded-lg">
      <h2 className="text-xl font-bold text-white">{user.name}</h2>
      
      {/* ⚠️ Flagged: Interactive button with raw emoji and no aria-label */}
      <button className="px-4 py-2 bg-indigo-600 text-white rounded">
        🚀 Upgrade Account
      </button>

      {/* ⚠️ Flagged: Removed focus outline without focus-visible replacement */}
      <button className="outline-none px-3 py-1 text-sm text-zinc-400">
        Settings
      </button>
    </div>
  );
};
