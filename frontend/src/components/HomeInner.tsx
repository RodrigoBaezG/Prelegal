'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DocChat from '@/components/DocChat';
import NDAPreview from '@/components/NDAPreview';
import GenericPreview from '@/components/GenericPreview';
import { DEFAULT_NDA_DATA, NDAFormData } from '@/lib/ndaTemplate';

// ---------------------------------------------------------------------------
// Required fields per document type (for completion check)
// ---------------------------------------------------------------------------

const NDA_REQUIRED = [
  'purpose', 'effectiveDate', 'governingLaw', 'jurisdiction',
  'party1Name', 'party1Title', 'party1Company', 'party1NoticeAddress', 'party1Date',
  'party2Name', 'party2Title', 'party2Company', 'party2NoticeAddress', 'party2Date',
];

const REQUIRED_BY_DOC: Record<string, string[]> = {
  'Mutual NDA': NDA_REQUIRED,
  'Mutual NDA Cover Page': NDA_REQUIRED,
  'Cloud Service Agreement (CSA)': ['provider', 'customer', 'effectiveDate', 'governingLaw', 'chosenCourts', 'subscriptionPeriod', 'fees'],
  'Design Partner Agreement': ['provider', 'partner', 'effectiveDate', 'term', 'program', 'governingLaw', 'chosenCourts'],
  'Service Level Agreement (SLA)': ['targetUptime', 'targetResponseTime', 'supportChannel'],
  'Professional Services Agreement (PSA)': ['provider', 'customer', 'effectiveDate', 'governingLaw', 'chosenCourts', 'deliverables', 'fees'],
  'Data Processing Agreement (DPA)': ['provider', 'customer', 'categoriesOfPersonalData', 'natureAndPurposeOfProcessing', 'durationOfProcessing'],
  'Partnership Agreement': ['company', 'partner', 'effectiveDate', 'endDate', 'obligations', 'governingLaw', 'chosenCourts'],
  'Software License Agreement': ['provider', 'customer', 'effectiveDate', 'governingLaw', 'chosenCourts', 'subscriptionPeriod', 'licenseLimits', 'fees'],
  'Pilot Agreement': ['provider', 'customer', 'effectiveDate', 'pilotPeriod', 'governingLaw', 'chosenCourts'],
  'Business Associate Agreement (BAA)': ['provider', 'company', 'baaEffectiveDate', 'breachNotificationPeriod', 'agreement'],
  'AI Addendum': ['provider', 'customer', 'trainingData'],
};

const NDA_TYPES = new Set(['Mutual NDA']);

function isComplete(documentType: string | null, fields: Record<string, string>): boolean {
  if (!documentType) return false;
  const required = REQUIRED_BY_DOC[documentType] ?? [];
  return required.every((f) => fields[f]?.trim());
}

function toNDAFormData(fields: Record<string, string>): NDAFormData {
  return { ...DEFAULT_NDA_DATA, ...fields } as NDAFormData;
}

function docLabel(documentType: string | null): string {
  if (!documentType) return 'Legal Document Assistant';
  return documentType + ' Assistant';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [userEmail, setUserEmail] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const token = localStorage.getItem('prelegal_token');
    if (!token) { router.replace('/login'); return; }
    setUserEmail(localStorage.getItem('prelegal_email') || '');

    const restoreId = searchParams.get('restore');
    if (restoreId) {
      fetch(`/api/documents/${restoreId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((doc) => {
          if (doc) {
            setDocumentType(doc.document_type);
            setFields(doc.fields);
          }
        })
        .catch(() => {})
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [router, searchParams]);

  function handleUpdate(incoming: Record<string, string>) {
    const { documentType: newType, ...docFields } = incoming;
    if (newType && newType !== documentType) {
      setDocumentType(newType);
      setFields(docFields);
    } else {
      setFields((prev) => ({ ...prev, ...docFields }));
    }
  }

  const handleSave = useCallback(async () => {
    if (!documentType || Object.keys(fields).length === 0) return;
    const token = localStorage.getItem('prelegal_token');
    if (!token) return;

    setSaveStatus('saving');
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const title = `${documentType} — ${today}`;

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ document_type: documentType, title, fields }),
      });
      setSaveStatus(res.ok ? 'saved' : 'error');
    } catch {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus('idle'), 3000);
  }, [documentType, fields]);

  function handleSignOut() {
    localStorage.removeItem('prelegal_token');
    localStorage.removeItem('prelegal_email');
    router.replace('/login');
  }

  if (!ready) return null;

  const complete = isComplete(documentType, fields);
  const isNDA = documentType ? NDA_TYPES.has(documentType) : false;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-[#032147] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#209dd7] rounded flex items-center justify-center text-xs font-bold">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight">Prelegal</span>
          {documentType && (
            <span className="text-slate-400 text-sm ml-2">{documentType}</span>
          )}
        </div>
        <div className="flex items-center gap-5">
          {userEmail && (
            <span className="text-slate-400 text-xs hidden sm:block">{userEmail}</span>
          )}
          <button
            onClick={() => router.push('/documents')}
            className="text-slate-300 hover:text-white text-sm transition-colors"
          >
            My Documents
          </button>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — AI chat */}
        <div className="w-2/5 flex-shrink-0 flex flex-col overflow-hidden border-r border-slate-200">
          <DocChat
            documentType={documentType}
            onUpdate={handleUpdate}
            isComplete={complete}
            documentLabel={docLabel(documentType)}
          />
        </div>

        {/* Right — live preview */}
        <div className="flex-1 overflow-y-auto bg-slate-200">
          {isNDA ? (
            <NDAPreview
              data={toNDAFormData(fields)}
              onSave={handleSave}
              saveStatus={saveStatus}
            />
          ) : (
            <GenericPreview
              documentType={documentType || 'Legal Document'}
              fields={fields}
              onSave={handleSave}
              saveStatus={saveStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}
