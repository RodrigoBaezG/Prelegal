'use client';

interface SaveButtonProps {
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export default function SaveButton({ onSave, saveStatus }: SaveButtonProps) {
  return (
    <button
      onClick={onSave}
      disabled={saveStatus === 'saving'}
      className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
        saveStatus === 'saved'
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
          : saveStatus === 'error'
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
      }`}
    >
      {saveStatus === 'saving'
        ? 'Saving…'
        : saveStatus === 'saved'
        ? '✓ Saved'
        : saveStatus === 'error'
        ? 'Save failed'
        : 'Save Document'}
    </button>
  );
}
