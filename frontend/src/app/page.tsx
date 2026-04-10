'use client';

import { useState } from 'react';
import NDAForm from '@/components/NDAForm';
import NDAPreview from '@/components/NDAPreview';
import { NDAFormData } from '@/lib/ndaTemplate';

export default function Home() {
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [formData, setFormData] = useState<NDAFormData | null>(null);

  const handleSubmit = (data: NDAFormData) => {
    setFormData(data);
    setView('preview');
  };

  return (
    <>
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center text-xs font-bold">P</div>
          <span className="font-semibold text-lg tracking-tight">Prelegal</span>
        </div>
        <span className="text-slate-400 text-sm ml-2">Mutual NDA Creator</span>
      </header>

      <main>
        {view === 'form' ? (
          <NDAForm onSubmit={handleSubmit} initialData={formData} />
        ) : (
          <NDAPreview data={formData!} onBack={() => setView('form')} />
        )}
      </main>
    </>
  );
}
