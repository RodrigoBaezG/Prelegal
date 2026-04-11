'use client';

import { useState } from 'react';
import NDAForm from '@/components/NDAForm';
import NDAPreview from '@/components/NDAPreview';
import { DEFAULT_NDA_DATA, NDAFormData } from '@/lib/ndaTemplate';

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(DEFAULT_NDA_DATA);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-slate-900 text-white px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center text-xs font-bold">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight">Prelegal</span>
        </div>
        <span className="text-slate-400 text-sm ml-2">Mutual NDA Creator</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left column — form */}
        <div className="w-2/5 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50">
          <NDAForm data={formData} onChange={setFormData} />
        </div>

        {/* Right column — live preview */}
        <div className="flex-1 overflow-y-auto bg-slate-200">
          <NDAPreview data={formData} />
        </div>
      </div>
    </div>
  );
}
