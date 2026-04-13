'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentSummary {
  id: number;
  document_type: string;
  title: string;
  created_at: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function DocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('prelegal_token');
    if (!token) { router.replace('/login'); return; }

    fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleDelete(id: number) {
    const token = localStorage.getItem('prelegal_token');
    if (!token) return;
    setDeletingId(id);
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#032147] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#209dd7] rounded flex items-center justify-center text-xs font-bold">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight">Prelegal</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.push('/')}
            className="text-slate-300 hover:text-white text-sm transition-colors"
          >
            New Document
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('prelegal_token');
              localStorage.removeItem('prelegal_email');
              router.replace('/login');
            }}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#032147]">My Documents</h1>
          <p className="text-[#888888] text-sm mt-1">Your saved legal document drafts</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            Loading…
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-slate-500 font-medium mb-1">No saved documents yet</p>
            <p className="text-slate-400 text-sm mb-6">
              Chat with the AI to fill in a document, then click &quot;Save Document&quot; to store it here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#753991] hover:bg-[#5f2c75] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Create a document
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#032147] truncate">{doc.title}</p>
                  <p className="text-xs text-[#888888] mt-0.5">
                    {doc.document_type} &middot; Saved {formatDate(doc.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/?restore=${doc.id}`)}
                    className="bg-[#209dd7] hover:bg-[#1a8bbf] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="text-slate-400 hover:text-red-500 text-xs transition-colors disabled:opacity-50"
                  >
                    {deletingId === doc.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
