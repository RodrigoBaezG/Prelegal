'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NDAForm from '@/components/NDAForm';
import NDAPreview from '@/components/NDAPreview';
import { DEFAULT_NDA_DATA, NDAFormData } from '@/lib/ndaTemplate';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<NDAFormData>(DEFAULT_NDA_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('prelegal_authed')) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-[#032147] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#209dd7] rounded flex items-center justify-center text-xs font-bold">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight">Prelegal</span>
          <span className="text-slate-400 text-sm ml-2">Mutual NDA Creator</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('prelegal_authed');
            router.replace('/login');
          }}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Sign out
        </button>
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
