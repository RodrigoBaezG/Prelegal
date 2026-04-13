'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

// Only the full Mutual NDA uses the rich NDAPreview; Cover Page falls through to GenericPreview
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
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!localStorage.getItem('prelegal_authed')) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  function handleUpdate(incoming: Record<string, string>) {
    const { documentType: newType, ...docFields } = incoming;

    if (newType && newType !== documentType) {
      // Document type changed — reset fields for the new type
      setDocumentType(newType);
      setFields(docFields);
    } else {
      setFields((prev) => ({ ...prev, ...docFields }));
    }
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
            <NDAPreview data={toNDAFormData(fields)} />
          ) : (
            <GenericPreview
              documentType={documentType || 'Legal Document'}
              fields={fields}
            />
          )}
        </div>
      </div>
    </div>
  );
}
