'use client';

import { NDAFormData } from '@/lib/ndaTemplate';

interface Props {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

function SectionHeader({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
        {hint && <span className="ml-1.5 text-slate-400 font-normal text-xs">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white';

const textareaClass = inputClass + ' resize-none';

export default function NDAForm({ data, onChange }: Props) {
  const set = (field: keyof NDAFormData, value: string) =>
    onChange({ ...data, [field]: value });

  return (
    <div className="px-5 py-8 space-y-5">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-slate-900">Agreement Details</h1>
        <p className="text-slate-500 mt-1 text-xs">
          Fill in the fields to generate a live preview based on{' '}
          <a
            href="https://commonpaper.com/standards/mutual-nda/1.0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Common Paper Mutual NDA v1.0
          </a>
          .
        </p>
      </div>

      {/* Section 1: Agreement Terms */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <SectionHeader number={1} title="Agreement Terms" subtitle="Core terms of the NDA" />

        <Field label="Purpose" hint="How confidential information may be used" htmlFor="purpose">
          <textarea
            id="purpose"
            className={textareaClass}
            rows={3}
            value={data.purpose}
            onChange={(e) => set('purpose', e.target.value)}
            placeholder="e.g. Evaluating whether to enter into a business relationship with the other party."
          />
        </Field>

        <Field label="Effective Date" htmlFor="effectiveDate">
          <input
            id="effectiveDate"
            type="date"
            className={inputClass}
            value={data.effectiveDate}
            onChange={(e) => set('effectiveDate', e.target.value)}
          />
        </Field>

        <Field label="MNDA Term" hint="How long this agreement lasts">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mndaTermType"
                value="expires"
                checked={data.mndaTermType === 'expires'}
                onChange={() => set('mndaTermType', 'expires')}
                className="accent-blue-600"
              />
              <span className="text-sm text-slate-700">Expires after</span>
              <input
                type="number"
                min="1"
                aria-label="MNDA term years"
                className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={data.mndaTermYears}
                onChange={(e) => set('mndaTermYears', e.target.value)}
                disabled={data.mndaTermType !== 'expires'}
              />
              <span className="text-sm text-slate-700">year(s)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mndaTermType"
                value="continues"
                checked={data.mndaTermType === 'continues'}
                onChange={() => set('mndaTermType', 'continues')}
                className="accent-blue-600"
              />
              <span className="text-sm text-slate-700">Until terminated</span>
            </label>
          </div>
        </Field>

        <Field label="Term of Confidentiality" hint="How long confidential information is protected">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="confidentialityTermType"
                value="years"
                checked={data.confidentialityTermType === 'years'}
                onChange={() => set('confidentialityTermType', 'years')}
                className="accent-blue-600"
              />
              <input
                type="number"
                min="1"
                aria-label="Confidentiality term years"
                className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={data.confidentialityTermYears}
                onChange={(e) => set('confidentialityTermYears', e.target.value)}
                disabled={data.confidentialityTermType !== 'years'}
              />
              <span className="text-sm text-slate-700">year(s) + trade secret protection</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="confidentialityTermType"
                value="perpetuity"
                checked={data.confidentialityTermType === 'perpetuity'}
                onChange={() => set('confidentialityTermType', 'perpetuity')}
                className="accent-blue-600"
              />
              <span className="text-sm text-slate-700">In perpetuity</span>
            </label>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Governing Law" hint="State" htmlFor="governingLaw">
            <input
              id="governingLaw"
              type="text"
              className={inputClass}
              value={data.governingLaw}
              onChange={(e) => set('governingLaw', e.target.value)}
              placeholder="e.g. Delaware"
            />
          </Field>
          <Field label="Jurisdiction" hint="City/county and state" htmlFor="jurisdiction">
            <input
              id="jurisdiction"
              type="text"
              className={inputClass}
              value={data.jurisdiction}
              onChange={(e) => set('jurisdiction', e.target.value)}
              placeholder="e.g. New Castle, DE"
            />
          </Field>
        </div>

        <Field label="MNDA Modifications" hint="Optional" htmlFor="modifications">
          <textarea
            id="modifications"
            className={textareaClass}
            rows={2}
            value={data.modifications}
            onChange={(e) => set('modifications', e.target.value)}
            placeholder="List any modifications to the standard terms, or leave blank."
          />
        </Field>
      </div>

      {/* Section 2: Party 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <SectionHeader number={2} title="Party 1" subtitle="First signatory" />
        <PartyFields prefix="party1" data={data} set={set} />
      </div>

      {/* Section 3: Party 2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <SectionHeader number={3} title="Party 2" subtitle="Second signatory" />
        <PartyFields prefix="party2" data={data} set={set} />
      </div>
    </div>
  );
}

function PartyFields({
  prefix,
  data,
  set,
}: {
  prefix: 'party1' | 'party2';
  data: NDAFormData;
  set: (field: keyof NDAFormData, value: string) => void;
}) {
  const f = (suffix: string) =>
    `${prefix}${suffix.charAt(0).toUpperCase() + suffix.slice(1)}` as keyof NDAFormData;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" htmlFor={`${prefix}-name`}>
          <input
            id={`${prefix}-name`}
            type="text"
            className={inputClass}
            value={data[f('name')] as string}
            onChange={(e) => set(f('name'), e.target.value)}
            placeholder="Jane Smith"
          />
        </Field>
        <Field label="Title" htmlFor={`${prefix}-title`}>
          <input
            id={`${prefix}-title`}
            type="text"
            className={inputClass}
            value={data[f('title')] as string}
            onChange={(e) => set(f('title'), e.target.value)}
            placeholder="CEO"
          />
        </Field>
      </div>
      <Field label="Company" htmlFor={`${prefix}-company`}>
        <input
          id={`${prefix}-company`}
          type="text"
          className={inputClass}
          value={data[f('company')] as string}
          onChange={(e) => set(f('company'), e.target.value)}
          placeholder="Acme Corp"
        />
      </Field>
      <Field label="Notice Address" hint="Email or postal" htmlFor={`${prefix}-notice`}>
        <input
          id={`${prefix}-notice`}
          type="text"
          className={inputClass}
          value={data[f('noticeAddress')] as string}
          onChange={(e) => set(f('noticeAddress'), e.target.value)}
          placeholder="legal@acmecorp.com"
        />
      </Field>
      <Field label="Date" htmlFor={`${prefix}-date`}>
        <input
          id={`${prefix}-date`}
          type="date"
          className={inputClass}
          value={data[f('date')] as string}
          onChange={(e) => set(f('date'), e.target.value)}
        />
      </Field>
    </div>
  );
}
