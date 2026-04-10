'use client';

import { useState } from 'react';
import { NDAFormData } from '@/lib/ndaTemplate';

interface Props {
  onSubmit: (data: NDAFormData) => void;
  initialData: NDAFormData | null;
}

const DEFAULT_DATA: NDAFormData = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: new Date().toISOString().split('T')[0],
  mndaTermType: 'expires',
  mndaTermYears: '1',
  confidentialityTermType: 'years',
  confidentialityTermYears: '1',
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
  party1Name: '',
  party1Title: '',
  party1Company: '',
  party1NoticeAddress: '',
  party1Date: '',
  party2Name: '',
  party2Title: '',
  party2Company: '',
  party2NoticeAddress: '',
  party2Date: '',
};

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
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

const textareaClass = inputClass + ' resize-none';

export default function NDAForm({ onSubmit, initialData }: Props) {
  const [data, setData] = useState<NDAFormData>(initialData ?? DEFAULT_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof NDAFormData, string>>>({});

  const set = (field: keyof NDAFormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const required: (keyof NDAFormData)[] = [
      'purpose',
      'effectiveDate',
      'governingLaw',
      'jurisdiction',
      'party1Name',
      'party1Company',
      'party2Name',
      'party2Company',
    ];
    const newErrors: Partial<Record<keyof NDAFormData, string>> = {};
    for (const field of required) {
      if (!data[field]?.trim()) {
        newErrors[field] = 'This field is required.';
      }
    }
    if (data.mndaTermType === 'expires') {
      const years = Number(data.mndaTermYears);
      if (!Number.isInteger(years) || years < 1) {
        newErrors.mndaTermYears = 'Please enter a whole number of years (minimum 1).';
      }
    }
    if (data.confidentialityTermType === 'years') {
      const years = Number(data.confidentialityTermYears);
      if (!Number.isInteger(years) || years < 1) {
        newErrors.confidentialityTermYears = 'Please enter a whole number of years (minimum 1).';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(data);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mutual NDA Generator</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Fill in the details below to generate a Mutual Non-Disclosure Agreement based on the{' '}
          <a
            href="https://commonpaper.com/standards/mutual-nda/1.0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Common Paper Standard Terms v1.0
          </a>
          .
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Section 1: Agreement Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <SectionHeader number={1} title="Agreement Details" subtitle="Core terms of the NDA" />
          <div className="space-y-5">
            <Field label="Purpose" hint="How confidential information may be used" htmlFor="purpose">
              <textarea
                id="purpose"
                className={textareaClass}
                rows={3}
                value={data.purpose}
                onChange={(e) => set('purpose', e.target.value)}
                placeholder="e.g. Evaluating whether to enter into a business relationship with the other party."
              />
              {errors.purpose && <p className="text-red-500 text-xs">{errors.purpose}</p>}
            </Field>

            <Field label="Effective Date" htmlFor="effectiveDate">
              <input
                id="effectiveDate"
                type="date"
                className={inputClass}
                value={data.effectiveDate}
                onChange={(e) => set('effectiveDate', e.target.value)}
              />
              {errors.effectiveDate && <p className="text-red-500 text-xs">{errors.effectiveDate}</p>}
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
                    className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.mndaTermYears}
                    onChange={(e) => set('mndaTermYears', e.target.value)}
                    disabled={data.mndaTermType !== 'expires'}
                  />
                  <span className="text-sm text-slate-700">year(s) from Effective Date</span>
                </label>
                {errors.mndaTermYears && <p className="text-red-500 text-xs ml-6">{errors.mndaTermYears}</p>}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="mndaTermType"
                    value="continues"
                    checked={data.mndaTermType === 'continues'}
                    onChange={() => set('mndaTermType', 'continues')}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-slate-700">Continues until terminated in accordance with the terms of the MNDA</span>
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
                    className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.confidentialityTermYears}
                    onChange={(e) => set('confidentialityTermYears', e.target.value)}
                    disabled={data.confidentialityTermType !== 'years'}
                  />
                  <span className="text-sm text-slate-700">year(s) from Effective Date (plus trade secret protection)</span>
                </label>
                {errors.confidentialityTermYears && (
                  <p className="text-red-500 text-xs ml-6">{errors.confidentialityTermYears}</p>
                )}
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
                {errors.governingLaw && <p className="text-red-500 text-xs">{errors.governingLaw}</p>}
              </Field>
              <Field label="Jurisdiction" hint="City/county and state" htmlFor="jurisdiction">
                <input
                  id="jurisdiction"
                  type="text"
                  className={inputClass}
                  value={data.jurisdiction}
                  onChange={(e) => set('jurisdiction', e.target.value)}
                  placeholder="e.g. courts located in New Castle, DE"
                />
                {errors.jurisdiction && <p className="text-red-500 text-xs">{errors.jurisdiction}</p>}
              </Field>
            </div>

            <Field label="MNDA Modifications" hint="Optional — any changes to the standard terms" htmlFor="modifications">
              <textarea
                id="modifications"
                className={textareaClass}
                rows={3}
                value={data.modifications}
                onChange={(e) => set('modifications', e.target.value)}
                placeholder="List any modifications to the standard terms here, or leave blank if none."
              />
            </Field>
          </div>
        </div>

        {/* Section 2: Party 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <SectionHeader number={2} title="Party 1" subtitle="First signatory to the agreement" />
          <PartyFields prefix="party1" data={data} set={set} errors={errors} />
        </div>

        {/* Section 3: Party 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <SectionHeader number={3} title="Party 2" subtitle="Second signatory to the agreement" />
          <PartyFields prefix="party2" data={data} set={set} errors={errors} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition text-sm"
          >
            Generate NDA Preview →
          </button>
        </div>
      </form>
    </div>
  );
}

function PartyFields({
  prefix,
  data,
  set,
  errors,
}: {
  prefix: 'party1' | 'party2';
  data: NDAFormData;
  set: (field: keyof NDAFormData, value: string) => void;
  errors: Partial<Record<keyof NDAFormData, string>>;
}) {
  const field = (suffix: string) => `${prefix}${suffix.charAt(0).toUpperCase() + suffix.slice(1)}` as keyof NDAFormData;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" htmlFor={`${prefix}-name`}>
          <input
            id={`${prefix}-name`}
            type="text"
            className={inputClass}
            value={data[field('name')] as string}
            onChange={(e) => set(field('name'), e.target.value)}
            placeholder="Jane Smith"
          />
          {errors[field('name')] && <p className="text-red-500 text-xs">{errors[field('name')]}</p>}
        </Field>
        <Field label="Title" htmlFor={`${prefix}-title`}>
          <input
            id={`${prefix}-title`}
            type="text"
            className={inputClass}
            value={data[field('title')] as string}
            onChange={(e) => set(field('title'), e.target.value)}
            placeholder="CEO"
          />
        </Field>
      </div>
      <Field label="Company" htmlFor={`${prefix}-company`}>
        <input
          id={`${prefix}-company`}
          type="text"
          className={inputClass}
          value={data[field('company')] as string}
          onChange={(e) => set(field('company'), e.target.value)}
          placeholder="Acme Corp"
        />
        {errors[field('company')] && <p className="text-red-500 text-xs">{errors[field('company')]}</p>}
      </Field>
      <Field label="Notice Address" hint="Email or postal address for legal notices" htmlFor={`${prefix}-notice`}>
        <input
          id={`${prefix}-notice`}
          type="text"
          className={inputClass}
          value={data[field('noticeAddress')] as string}
          onChange={(e) => set(field('noticeAddress'), e.target.value)}
          placeholder="legal@acmecorp.com or 123 Main St, Wilmington, DE 19801"
        />
      </Field>
      <Field label="Date" htmlFor={`${prefix}-date`}>
        <input
          id={`${prefix}-date`}
          type="date"
          className={inputClass}
          value={data[field('date')] as string}
          onChange={(e) => set(field('date'), e.target.value)}
        />
      </Field>
    </div>
  );
}
