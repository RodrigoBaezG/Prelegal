'use client';

import { cloneElement, useRef, useState } from 'react';
import {
  NDAFormData,
  STANDARD_TERMS,
  getMNDATermText,
  getConfidentialityTermText,
  getStandardTermText,
} from '@/lib/ndaTemplate';

interface Props {
  data: NDAFormData;
  onBack: () => void;
}

function formatDate(iso: string): string {
  if (!iso) return '_______________';
  const [year, month, day] = iso.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function NDAPreview({ data, onBack }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      let pageNumber = 1;
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -(pageHeight * pageNumber), imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageNumber++;
      }

      const party1 = data.party1Company || 'Party1';
      const party2 = data.party2Company || 'Party2';
      pdf.save(`Mutual-NDA_${party1}_${party2}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
        >
          ← Back to Form
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Mutual Non-Disclosure Agreement</span>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition"
          >
            {downloading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Generating PDF…
              </>
            ) : (
              <>↓ Download PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div
          ref={previewRef}
          className="bg-white shadow-lg rounded-sm px-16 py-14 font-serif text-slate-900"
          style={{ fontSize: '13px', lineHeight: '1.8' }}
        >
          {/* Title */}
          <h1 className="text-center text-2xl font-bold mb-1 tracking-wide uppercase">
            Mutual Non-Disclosure Agreement
          </h1>
          <p className="text-center text-sm text-slate-500 mb-10">
            Common Paper Mutual NDA Standard Terms Version 1.0
          </p>

          {/* ── COVER PAGE ── */}
          <h2 className="text-base font-bold uppercase tracking-widest mb-6 border-b border-slate-300 pb-2">
            Cover Page
          </h2>

          <table className="w-full mb-8 text-sm border-collapse">
            <tbody>
              <CoverRow label="Purpose" hint="How Confidential Information may be used">
                {data.purpose || <em className="text-slate-400">Not specified</em>}
              </CoverRow>
              <CoverRow label="Effective Date">
                {formatDate(data.effectiveDate)}
              </CoverRow>
              <CoverRow label="MNDA Term" hint="The length of this MNDA">
                {getMNDATermText(data)}
              </CoverRow>
              <CoverRow label="Term of Confidentiality" hint="How long Confidential Information is protected">
                {getConfidentialityTermText(data)}
              </CoverRow>
              <CoverRow label="Governing Law & Jurisdiction">
                <div>
                  <span className="font-medium">Governing Law:</span>{' '}
                  {data.governingLaw || <em className="text-slate-400">Not specified</em>}
                </div>
                <div className="mt-1">
                  <span className="font-medium">Jurisdiction:</span>{' '}
                  {data.jurisdiction || <em className="text-slate-400">Not specified</em>}
                </div>
              </CoverRow>
              {data.modifications && (
                <CoverRow label="MNDA Modifications">
                  <div className="whitespace-pre-wrap">{data.modifications}</div>
                </CoverRow>
              )}
            </tbody>
          </table>

          <p className="text-sm text-slate-600 mb-8 italic">
            By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
          </p>

          {/* Signature Table */}
          <table className="w-full border-collapse border border-slate-300 text-sm mb-10">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-300 px-4 py-2 text-left w-1/4 font-semibold"></th>
                <th className="border border-slate-300 px-4 py-2 text-center font-semibold">Party 1</th>
                <th className="border border-slate-300 px-4 py-2 text-center font-semibold">Party 2</th>
              </tr>
            </thead>
            <tbody>
              <SigRow label="Signature">
                <div className="h-12" />
              </SigRow>
              <SigRow label="Print Name">
                <span>{data.party1Name || <BlankLine />}</span>
                <span>{data.party2Name || <BlankLine />}</span>
              </SigRow>
              <SigRow label="Title">
                <span>{data.party1Title || <BlankLine />}</span>
                <span>{data.party2Title || <BlankLine />}</span>
              </SigRow>
              <SigRow label="Company">
                <span>{data.party1Company || <BlankLine />}</span>
                <span>{data.party2Company || <BlankLine />}</span>
              </SigRow>
              <SigRow label="Notice Address">
                <span>{data.party1NoticeAddress || <BlankLine />}</span>
                <span>{data.party2NoticeAddress || <BlankLine />}</span>
              </SigRow>
              <SigRow label="Date">
                <span>{data.party1Date ? formatDate(data.party1Date) : <BlankLine />}</span>
                <span>{data.party2Date ? formatDate(data.party2Date) : <BlankLine />}</span>
              </SigRow>
            </tbody>
          </table>

          <p className="text-xs text-slate-400 text-center mb-12">
            Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" className="underline">
              CC BY 4.0
            </a>
            .
          </p>

          {/* ── STANDARD TERMS ── */}
          <h2 className="text-base font-bold uppercase tracking-widest mb-6 border-b border-slate-300 pb-2">
            Standard Terms
          </h2>

          <div className="space-y-5">
            {STANDARD_TERMS.map((term) => (
              <div key={term.number}>
                <p className="font-semibold mb-1">
                  {term.number}. {term.title}.
                </p>
                <p className="text-slate-800 text-justify">{getStandardTermText(term, data)}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center mt-12">
            Common Paper Mutual Non-Disclosure Agreement{' '}
            <a href="https://commonpaper.com/standards/mutual-nda/1.0/" className="underline">
              Version 1.0
            </a>{' '}
            free to use under{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" className="underline">
              CC BY 4.0
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function CoverRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-slate-200">
      <td className="py-3 pr-6 align-top w-1/3">
        <div className="font-semibold text-slate-800">{label}</div>
        {hint && <div className="text-xs text-slate-400 mt-0.5">{hint}</div>}
      </td>
      <td className="py-3 text-slate-700">{children}</td>
    </tr>
  );
}

function SigRow({ label, children }: { label: string; children: React.ReactNode }) {
  const kids = Array.isArray(children)
    ? children
    : [children, cloneElement(children as React.ReactElement)];
  return (
    <tr>
      <td className="border border-slate-300 px-4 py-3 font-medium text-slate-700 bg-slate-50 align-top">
        {label}
      </td>
      <td className="border border-slate-300 px-4 py-3 align-top">{kids[0]}</td>
      <td className="border border-slate-300 px-4 py-3 align-top">{kids[1]}</td>
    </tr>
  );
}

function BlankLine() {
  return <span className="text-slate-300">_______________</span>;
}
