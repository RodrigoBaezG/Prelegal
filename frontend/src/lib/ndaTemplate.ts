export interface NDAFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: 'expires' | 'continues';
  mndaTermYears: string;
  confidentialityTermType: 'years' | 'perpetuity';
  confidentialityTermYears: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1Name: string;
  party1Title: string;
  party1Company: string;
  party1NoticeAddress: string;
  party1Date: string;
  party2Name: string;
  party2Title: string;
  party2Company: string;
  party2NoticeAddress: string;
  party2Date: string;
}

export const DEFAULT_NDA_DATA: NDAFormData = {
  purpose: '',
  effectiveDate: '',
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

export function getMNDATermText(data: NDAFormData): string {
  if (data.mndaTermType === 'expires') {
    return `Expires ${data.mndaTermYears} year(s) from Effective Date.`;
  }
  return 'Continues until terminated in accordance with the terms of the MNDA.';
}

export function getConfidentialityTermText(data: NDAFormData): string {
  if (data.confidentialityTermType === 'years') {
    return `${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`;
  }
  return 'In perpetuity.';
}

export interface StandardTerm {
  number: number;
  title: string;
  text: string;
}

export const STANDARD_TERMS: StandardTerm[] = [
  {
    number: 1,
    title: 'Introduction',
    text: 'This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("MNDA") allows each party ("Disclosing Party") to disclose or make available information in connection with the Purpose which (1) the Disclosing Party identifies to the receiving party ("Receiving Party") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("Confidential Information"). Each party\'s Confidential Information also includes the existence and status of the parties\' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("Cover Page"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.',
  },
  {
    number: 2,
    title: 'Use and Protection of Confidential Information',
    text: 'The Receiving Party shall: (a) use Confidential Information solely for the Purpose; (b) not disclose Confidential Information to third parties without the Disclosing Party\'s prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the Purpose, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.',
  },
  {
    number: 3,
    title: 'Exceptions',
    text: "The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.",
  },
  {
    number: 4,
    title: 'Disclosures Required by Law',
    text: "The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.",
  },
  {
    number: 5,
    title: 'Term and Termination',
    text: 'This MNDA commences on the Effective Date and expires at the end of the MNDA Term. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party\'s obligations relating to Confidential Information will survive for the Term of Confidentiality, despite any expiration or termination of this MNDA.',
  },
  {
    number: 6,
    title: 'Return or Destruction of Confidential Information',
    text: "Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.",
  },
  {
    number: 7,
    title: 'Proprietary Rights',
    text: "The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.",
  },
  {
    number: 8,
    title: 'Disclaimer',
    text: 'ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.',
  },
  {
    number: 9,
    title: 'Governing Law and Jurisdiction',
    text: 'This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of [Governing Law], without regard to the conflict of laws provisions of such [Governing Law]. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in [Jurisdiction]. Each party irrevocably submits to the exclusive jurisdiction of such [Jurisdiction] in any such suit, action, or proceeding.',
  },
  {
    number: 10,
    title: 'Equitable Relief',
    text: 'A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.',
  },
  {
    number: 11,
    title: 'General',
    text: "Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.",
  },
];

export function getStandardTermText(term: StandardTerm, data: NDAFormData): string {
  return term.text
    .replace(/\[Governing Law\]/g, data.governingLaw || '[Governing Law]')
    .replace(/\[Jurisdiction\]/g, data.jurisdiction || '[Jurisdiction]');
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso: string): string {
  if (!iso) return '_______________';
  const [year, month, day] = iso.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function blank(val: string): string {
  return val ? esc(val) : '<span class="blank">_______________</span>';
}

export function generatePrintHTML(data: NDAFormData): string {
  const termsHTML = STANDARD_TERMS.map((term) => {
    const text = getStandardTermText(term, data);
    return `<div class="term">
      <p><strong>${term.number}. ${esc(term.title)}.</strong> ${esc(text)}</p>
    </div>`;
  }).join('\n');

  const mndaTerm = getMNDATermText(data);
  const confTerm = getConfidentialityTermText(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Mutual Non-Disclosure Agreement</title>
<style>
  @page { size: A4; margin: 1in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #111;
  }
  h1 {
    text-align: center;
    font-size: 17pt;
    font-weight: bold;
    margin-bottom: 4pt;
    text-transform: uppercase;
    letter-spacing: 1pt;
  }
  .subtitle {
    text-align: center;
    font-size: 9pt;
    color: #666;
    margin-bottom: 28pt;
  }
  h2 {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1.5pt;
    border-bottom: 1.5pt solid #333;
    padding-bottom: 4pt;
    margin-top: 28pt;
    margin-bottom: 14pt;
  }
  .cover-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18pt;
  }
  .cover-table tr {
    border-bottom: 0.5pt solid #ccc;
    page-break-inside: avoid;
  }
  .cover-table td {
    padding: 8pt 6pt;
    vertical-align: top;
  }
  .cover-table .label {
    font-weight: bold;
    width: 33%;
    padding-right: 14pt;
    color: #222;
  }
  .cover-table .hint {
    display: block;
    font-size: 8.5pt;
    color: #888;
    font-weight: normal;
    margin-top: 2pt;
  }
  .signing-note {
    font-style: italic;
    font-size: 10pt;
    color: #444;
    margin: 14pt 0 10pt;
  }
  .sig-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18pt;
    page-break-inside: avoid;
  }
  .sig-table th, .sig-table td {
    border: 0.75pt solid #888;
    padding: 7pt 10pt;
    text-align: left;
    vertical-align: top;
  }
  .sig-table thead th {
    background: #f0f0f0;
    font-weight: bold;
    text-align: center;
    font-size: 10pt;
  }
  .sig-table .row-label {
    background: #f7f7f7;
    font-weight: bold;
    width: 22%;
    font-size: 10pt;
  }
  .sig-cell { min-height: 28pt; }
  .term {
    margin-bottom: 10pt;
    page-break-inside: avoid;
  }
  .term p {
    text-align: justify;
  }
  .footer {
    font-size: 8pt;
    color: #888;
    text-align: center;
    margin-top: 28pt;
    border-top: 0.5pt solid #ccc;
    padding-top: 8pt;
  }
  .blank { color: #bbb; }
  @media print {
    .no-print { display: none; }
  }
</style>
</head>
<body>

<h1>Mutual Non-Disclosure Agreement</h1>
<p class="subtitle">Common Paper Mutual NDA Standard Terms Version 1.0</p>

<h2>Cover Page</h2>

<table class="cover-table">
  <tbody>
    <tr>
      <td class="label">Purpose<span class="hint">How Confidential Information may be used</span></td>
      <td>${blank(data.purpose)}</td>
    </tr>
    <tr>
      <td class="label">Effective Date</td>
      <td>${formatDate(data.effectiveDate)}</td>
    </tr>
    <tr>
      <td class="label">MNDA Term<span class="hint">The length of this MNDA</span></td>
      <td>${esc(mndaTerm)}</td>
    </tr>
    <tr>
      <td class="label">Term of Confidentiality<span class="hint">How long Confidential Information is protected</span></td>
      <td>${esc(confTerm)}</td>
    </tr>
    <tr>
      <td class="label">Governing Law &amp; Jurisdiction</td>
      <td>
        <strong>Governing Law:</strong> ${blank(data.governingLaw)}<br>
        <strong>Jurisdiction:</strong> ${blank(data.jurisdiction)}
      </td>
    </tr>
    ${data.modifications ? `<tr>
      <td class="label">MNDA Modifications</td>
      <td>${esc(data.modifications)}</td>
    </tr>` : ''}
  </tbody>
</table>

<p class="signing-note">By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.</p>

<table class="sig-table">
  <thead>
    <tr>
      <th></th>
      <th>Party 1</th>
      <th>Party 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="row-label">Signature</td>
      <td class="sig-cell"></td>
      <td class="sig-cell"></td>
    </tr>
    <tr>
      <td class="row-label">Print Name</td>
      <td>${blank(data.party1Name)}</td>
      <td>${blank(data.party2Name)}</td>
    </tr>
    <tr>
      <td class="row-label">Title</td>
      <td>${blank(data.party1Title)}</td>
      <td>${blank(data.party2Title)}</td>
    </tr>
    <tr>
      <td class="row-label">Company</td>
      <td>${blank(data.party1Company)}</td>
      <td>${blank(data.party2Company)}</td>
    </tr>
    <tr>
      <td class="row-label">Notice Address</td>
      <td>${blank(data.party1NoticeAddress)}</td>
      <td>${blank(data.party2NoticeAddress)}</td>
    </tr>
    <tr>
      <td class="row-label">Date</td>
      <td>${data.party1Date ? formatDate(data.party1Date) : '<span class="blank">_______________</span>'}</td>
      <td>${data.party2Date ? formatDate(data.party2Date) : '<span class="blank">_______________</span>'}</td>
    </tr>
  </tbody>
</table>

<p class="footer">
  Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0.
</p>

<h2>Standard Terms</h2>

${termsHTML}

<p class="footer">
  Common Paper Mutual Non-Disclosure Agreement Version 1.0 free to use under CC BY 4.0.
</p>

</body>
</html>`;
}
