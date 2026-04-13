'use client';

// Human-readable labels for all known document fields
const FIELD_LABELS: Record<string, string> = {
  // Common
  provider: 'Provider',
  customer: 'Customer',
  company: 'Company',
  partner: 'Partner',
  effectiveDate: 'Effective Date',
  governingLaw: 'Governing Law',
  chosenCourts: 'Chosen Courts / Jurisdiction',
  fees: 'Fees',
  paymentProcess: 'Payment Process',
  noticeAddress: 'Notice Address',
  agreement: 'Parent Agreement',
  // CSA / Software License
  generalCapAmount: 'General Cap Amount',
  increasedCapAmount: 'Increased Cap Amount',
  increasedClaims: 'Increased Claims',
  unlimitedClaims: 'Unlimited Claims',
  providerCoveredClaims: 'Provider Covered Claims',
  customerCoveredClaims: 'Customer Covered Claims',
  subscriptionPeriod: 'Subscription Period',
  nonRenewalNoticeDate: 'Non-Renewal Notice Date',
  technicalSupport: 'Technical Support',
  useLimitations: 'Use Limitations',
  prohibitedData: 'Prohibited Data',
  // Design Partner
  term: 'Term',
  program: 'Design Partner Program',
  // SLA
  targetUptime: 'Target Uptime',
  targetResponseTime: 'Target Response Time',
  supportChannel: 'Support Channel',
  uptimeCredit: 'Uptime Credit',
  responseTimeCredit: 'Response Time Credit',
  scheduledDowntime: 'Scheduled Downtime',
  // PSA
  deliverables: 'Deliverables',
  paymentPeriod: 'Payment Period',
  sowTerm: 'SOW Term',
  customerObligations: 'Customer Obligations',
  rejectionPeriod: 'Rejection Period',
  resubmissionPeriod: 'Resubmission Period',
  insuranceMinimums: 'Insurance Minimums',
  customerPolicies: 'Customer Policies',
  // DPA
  categoriesOfPersonalData: 'Categories of Personal Data',
  categoriesOfDataSubjects: 'Categories of Data Subjects',
  specialCategoryData: 'Special Category Data',
  natureAndPurposeOfProcessing: 'Nature & Purpose of Processing',
  durationOfProcessing: 'Duration of Processing',
  approvedSubprocessors: 'Approved Subprocessors',
  governingMemberState: 'Governing Member State (EU)',
  securityPolicy: 'Security Policy',
  providerSecurityContact: 'Provider Security Contact',
  frequencyOfTransfer: 'Frequency of Transfer',
  // Partnership
  endDate: 'End Date',
  obligations: 'Obligations',
  territory: 'Territory',
  brandGuidelines: 'Brand Guidelines',
  paymentSchedule: 'Payment Schedule',
  companyCoveredClaim: 'Company Covered Claim',
  partnerCoveredClaims: 'Partner Covered Claims',
  // Software License
  licenseLimits: 'License Limits',
  warrantyPeriod: 'Warranty Period',
  deletionProcedure: 'Deletion Procedure',
  // Pilot
  pilotPeriod: 'Pilot Period',
  // BAA
  baaEffectiveDate: 'BAA Effective Date',
  breachNotificationPeriod: 'Breach Notification Period',
  limitations: 'Limitations (PHI restrictions)',
  // AI Addendum
  trainingData: 'Training Data',
  trainingPurposes: 'Training Purposes',
  trainingRestrictions: 'Training Restrictions',
  improvementRestrictions: 'Improvement Restrictions',
};

interface Props {
  documentType: string;
  fields: Record<string, string>;
}

function formatValue(val: string): string {
  // ISO date → readable
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
  return val;
}

export default function GenericPreview({ documentType, fields }: Props) {
  const knownKeys = Object.keys(fields).filter(
    (k) => k !== 'documentType' && fields[k]
  );

  const handleDownload = () => {
    const rows = knownKeys
      .map((k) => {
        const label = FIELD_LABELS[k] || k;
        const val = formatValue(fields[k]);
        return `<tr><td class="label">${label}</td><td>${val}</td></tr>`;
      })
      .join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${documentType}</title>
<style>
  @page { size: A4; margin: 1in; }
  body { font-family: Georgia, serif; font-size: 11pt; line-height: 1.65; color: #111; }
  h1 { text-align: center; font-size: 17pt; text-transform: uppercase; letter-spacing: 1pt; margin-bottom: 4pt; }
  .subtitle { text-align: center; font-size: 9pt; color: #666; margin-bottom: 28pt; }
  table { width: 100%; border-collapse: collapse; margin-top: 20pt; }
  tr { border-bottom: 0.5pt solid #ccc; }
  td { padding: 8pt 6pt; vertical-align: top; }
  .label { font-weight: bold; width: 35%; color: #222; }
  .blank { color: #bbb; }
</style>
</head>
<body>
<h1>${documentType}</h1>
<p class="subtitle">Common Paper Legal Agreement</p>
<table><tbody>${rows}</tbody></table>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    const cleanup = () => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    };

    iframe.onerror = cleanup;
    iframe.onload = () => {
      iframe.contentWindow?.print();
      iframe.contentWindow?.addEventListener('afterprint', cleanup);
      // Fallback: clean up after 30 s if afterprint never fires
      setTimeout(() => { if (document.body.contains(iframe)) cleanup(); }, 30000);
    };
  };

  return (
    <div className="min-h-full">
      {/* Sticky toolbar */}
      <div className="bg-white border-b border-slate-300 px-5 py-2.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Live Preview</span>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
        >
          ↓ Download PDF
        </button>
      </div>

      <div className="py-6 px-4">
        <div className="bg-white shadow-md rounded-sm px-10 py-10 font-serif text-slate-900" style={{ fontSize: '12px', lineHeight: '1.75' }}>
          <h1 className="text-center text-2xl font-bold mb-1 tracking-wide uppercase">
            {documentType}
          </h1>
          <p className="text-center text-sm text-slate-500 mb-10">Common Paper Legal Agreement</p>

          {knownKeys.length === 0 ? (
            <p className="text-slate-400 italic text-center mt-10">
              Fields will appear here as the AI gathers information from the chat.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse mb-8">
              <tbody>
                {knownKeys.map((key) => (
                  <tr key={key} className="border-b border-slate-200">
                    <td className="py-3 pr-6 align-top w-1/3 font-semibold text-slate-800">
                      {FIELD_LABELS[key] || key}
                    </td>
                    <td className="py-3 text-slate-700 whitespace-pre-wrap">
                      {formatValue(fields[key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {knownKeys.length > 0 && (
            <p className="text-xs text-slate-400 text-center mt-8">
              Common Paper Legal Agreement — free to use under{' '}
              <a href="https://creativecommons.org/licenses/by/4.0/" className="underline">CC BY 4.0</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
