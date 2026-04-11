import {
  getMNDATermText,
  getConfidentialityTermText,
  getStandardTermText,
  generatePrintHTML,
  DEFAULT_NDA_DATA,
  STANDARD_TERMS,
  NDAFormData,
} from '../lib/ndaTemplate';

const BASE: NDAFormData = {
  purpose: 'Evaluating a potential partnership',
  effectiveDate: '2026-01-15',
  mndaTermType: 'expires',
  mndaTermYears: '2',
  confidentialityTermType: 'years',
  confidentialityTermYears: '3',
  governingLaw: 'California',
  jurisdiction: 'San Francisco, CA',
  modifications: '',
  party1Name: 'Alice Smith',
  party1Title: 'CEO',
  party1Company: 'Acme Corp',
  party1NoticeAddress: 'alice@acme.com',
  party1Date: '2026-01-15',
  party2Name: 'Bob Jones',
  party2Title: 'CTO',
  party2Company: 'Beta Inc',
  party2NoticeAddress: 'bob@beta.com',
  party2Date: '2026-01-20',
};

// ─── getMNDATermText ──────────────────────────────────────────────────────────

describe('getMNDATermText', () => {
  it('returns expiry text with the given number of years', () => {
    expect(getMNDATermText({ ...BASE, mndaTermType: 'expires', mndaTermYears: '2' })).toBe(
      'Expires 2 year(s) from Effective Date.'
    );
  });

  it('handles 1 year correctly', () => {
    expect(getMNDATermText({ ...BASE, mndaTermType: 'expires', mndaTermYears: '1' })).toBe(
      'Expires 1 year(s) from Effective Date.'
    );
  });

  it('handles multi-year values correctly', () => {
    expect(getMNDATermText({ ...BASE, mndaTermType: 'expires', mndaTermYears: '10' })).toBe(
      'Expires 10 year(s) from Effective Date.'
    );
  });

  it('returns continues-until-terminated text when type is continues', () => {
    expect(getMNDATermText({ ...BASE, mndaTermType: 'continues' })).toBe(
      'Continues until terminated in accordance with the terms of the MNDA.'
    );
  });
});

// ─── getConfidentialityTermText ───────────────────────────────────────────────

describe('getConfidentialityTermText', () => {
  it('returns years text with trade secret protection', () => {
    const result = getConfidentialityTermText({
      ...BASE,
      confidentialityTermType: 'years',
      confidentialityTermYears: '3',
    });
    expect(result).toBe(
      '3 year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.'
    );
  });

  it('handles 1 year correctly', () => {
    const result = getConfidentialityTermText({
      ...BASE,
      confidentialityTermType: 'years',
      confidentialityTermYears: '1',
    });
    expect(result).toMatch(/^1 year\(s\)/);
  });

  it('returns in perpetuity text', () => {
    expect(
      getConfidentialityTermText({ ...BASE, confidentialityTermType: 'perpetuity' })
    ).toBe('In perpetuity.');
  });
});

// ─── getStandardTermText ──────────────────────────────────────────────────────

describe('getStandardTermText', () => {
  const govLawTerm = STANDARD_TERMS.find((t) => t.number === 9)!;
  const introTerm = STANDARD_TERMS.find((t) => t.number === 1)!;

  it('replaces [Governing Law] with the provided value', () => {
    const result = getStandardTermText(govLawTerm, { ...BASE, governingLaw: 'Delaware' });
    expect(result).toContain('Delaware');
    expect(result).not.toContain('[Governing Law]');
  });

  it('replaces [Jurisdiction] with the provided value', () => {
    const result = getStandardTermText(govLawTerm, { ...BASE, jurisdiction: 'New Castle, DE' });
    expect(result).toContain('New Castle, DE');
    expect(result).not.toContain('[Jurisdiction]');
  });

  it('replaces both placeholders in the same term', () => {
    const result = getStandardTermText(govLawTerm, {
      ...BASE,
      governingLaw: 'Texas',
      jurisdiction: 'Austin, TX',
    });
    expect(result).toContain('Texas');
    expect(result).toContain('Austin, TX');
    expect(result).not.toContain('[Governing Law]');
    expect(result).not.toContain('[Jurisdiction]');
  });

  it('keeps placeholders when values are empty', () => {
    const result = getStandardTermText(govLawTerm, {
      ...BASE,
      governingLaw: '',
      jurisdiction: '',
    });
    expect(result).toContain('[Governing Law]');
    expect(result).toContain('[Jurisdiction]');
  });

  it('does not alter terms that have no placeholders', () => {
    const result = getStandardTermText(introTerm, BASE);
    expect(result).toBe(introTerm.text);
  });

  it('replaces multiple occurrences of [Governing Law] in term 9', () => {
    const result = getStandardTermText(govLawTerm, { ...BASE, governingLaw: 'Nevada' });
    // Term 9 mentions Governing Law twice — neither should remain
    expect(result.includes('[Governing Law]')).toBe(false);
    expect((result.match(/Nevada/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});

// ─── generatePrintHTML ────────────────────────────────────────────────────────

describe('generatePrintHTML', () => {
  it('returns a valid HTML document string', () => {
    const html = generatePrintHTML(BASE);
    expect(html).toMatch(/^<!DOCTYPE html>/i);
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
  });

  it('includes the purpose text', () => {
    const html = generatePrintHTML(BASE);
    expect(html).toContain('Evaluating a potential partnership');
  });

  it('includes party 1 name', () => {
    const html = generatePrintHTML(BASE);
    expect(html).toContain('Alice Smith');
  });

  it('includes party 2 name', () => {
    const html = generatePrintHTML(BASE);
    expect(html).toContain('Bob Jones');
  });

  it('includes party 1 company', () => {
    const html = generatePrintHTML(BASE);
    expect(html).toContain('Acme Corp');
  });

  it('includes party 2 company', () => {
    const html = generatePrintHTML(BASE);
    expect(html).toContain('Beta Inc');
  });

  it('formats effective date in long form', () => {
    const html = generatePrintHTML({ ...BASE, effectiveDate: '2026-01-15' });
    expect(html).toContain('January 15, 2026');
  });

  it('formats party dates in long form', () => {
    const html = generatePrintHTML({ ...BASE, party2Date: '2026-03-20' });
    expect(html).toContain('March 20, 2026');
  });

  it('includes the correct MNDA term text', () => {
    const html = generatePrintHTML({ ...BASE, mndaTermType: 'expires', mndaTermYears: '2' });
    expect(html).toContain('Expires 2 year(s) from Effective Date.');
  });

  it('includes continues-until-terminated text when selected', () => {
    const html = generatePrintHTML({ ...BASE, mndaTermType: 'continues' });
    expect(html).toContain('Continues until terminated');
  });

  it('includes the correct confidentiality term text', () => {
    const html = generatePrintHTML({
      ...BASE,
      confidentialityTermType: 'years',
      confidentialityTermYears: '3',
    });
    expect(html).toContain('3 year(s) from Effective Date');
  });

  it('includes in perpetuity text when selected', () => {
    const html = generatePrintHTML({ ...BASE, confidentialityTermType: 'perpetuity' });
    expect(html).toContain('In perpetuity.');
  });

  it('includes governing law in the cover page', () => {
    const html = generatePrintHTML({ ...BASE, governingLaw: 'Oregon' });
    expect(html).toContain('Oregon');
  });

  it('interpolates governing law into standard term 9', () => {
    const html = generatePrintHTML({ ...BASE, governingLaw: 'Nevada' });
    const standardTermsSection = html.split('Standard Terms')[1] ?? '';
    expect(standardTermsSection).toContain('Nevada');
    expect(standardTermsSection).not.toContain('[Governing Law]');
  });

  it('includes all 11 standard term titles', () => {
    const html = generatePrintHTML(BASE);
    STANDARD_TERMS.forEach((term) => {
      expect(html).toContain(term.title);
    });
  });

  it('shows blank placeholder for empty party 1 name', () => {
    const html = generatePrintHTML({ ...BASE, party1Name: '' });
    expect(html).toContain('_______________');
  });

  it('shows blank placeholder for empty party 2 company', () => {
    const html = generatePrintHTML({ ...BASE, party2Company: '' });
    expect(html).toContain('_______________');
  });

  it('omits the modifications row when modifications is empty', () => {
    const html = generatePrintHTML({ ...BASE, modifications: '' });
    expect(html).not.toContain('MNDA Modifications');
  });

  it('includes the modifications row when modifications is provided', () => {
    const html = generatePrintHTML({ ...BASE, modifications: 'Section 5 is waived.' });
    expect(html).toContain('MNDA Modifications');
    expect(html).toContain('Section 5 is waived.');
  });

  it('escapes < and > in user input to prevent XSS', () => {
    const html = generatePrintHTML({
      ...BASE,
      purpose: '<script>alert("xss")</script>',
    });
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes & in user input', () => {
    const html = generatePrintHTML({ ...BASE, party1Company: 'Smith & Jones LLC' });
    expect(html).toContain('Smith &amp; Jones LLC');
  });

  it('escapes " in user input', () => {
    const html = generatePrintHTML({ ...BASE, party1Name: 'Alice "The CEO" Smith' });
    expect(html).toContain('&quot;The CEO&quot;');
  });

  it('escapes < and > in governingLaw to prevent XSS in standard terms', () => {
    const html = generatePrintHTML({ ...BASE, governingLaw: '<script>evil()</script>' });
    expect(html).not.toContain('<script>evil');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes < and > in jurisdiction to prevent XSS in standard terms', () => {
    const html = generatePrintHTML({ ...BASE, jurisdiction: '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x');
  });

  it('handles empty effectiveDate gracefully', () => {
    const html = generatePrintHTML({ ...BASE, effectiveDate: '' });
    expect(html).toContain('_______________');
  });

  it('includes the CC BY 4.0 attribution', () => {
    const html = generatePrintHTML(BASE);
    expect(html).toContain('CC BY 4.0');
  });
});

// ─── DEFAULT_NDA_DATA ─────────────────────────────────────────────────────────

describe('DEFAULT_NDA_DATA', () => {
  it('has mndaTermType of expires', () => {
    expect(DEFAULT_NDA_DATA.mndaTermType).toBe('expires');
  });

  it('has mndaTermYears of 1', () => {
    expect(DEFAULT_NDA_DATA.mndaTermYears).toBe('1');
  });

  it('has confidentialityTermType of years', () => {
    expect(DEFAULT_NDA_DATA.confidentialityTermType).toBe('years');
  });

  it('has confidentialityTermYears of 1', () => {
    expect(DEFAULT_NDA_DATA.confidentialityTermYears).toBe('1');
  });

  it('has a non-empty default purpose', () => {
    expect(DEFAULT_NDA_DATA.purpose.length).toBeGreaterThan(0);
  });

  it('has empty party name fields', () => {
    expect(DEFAULT_NDA_DATA.party1Name).toBe('');
    expect(DEFAULT_NDA_DATA.party2Name).toBe('');
  });

  it('has empty party company fields', () => {
    expect(DEFAULT_NDA_DATA.party1Company).toBe('');
    expect(DEFAULT_NDA_DATA.party2Company).toBe('');
  });

  it('has a valid ISO date for effectiveDate', () => {
    expect(DEFAULT_NDA_DATA.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('has empty modifications', () => {
    expect(DEFAULT_NDA_DATA.modifications).toBe('');
  });
});

// ─── STANDARD_TERMS ───────────────────────────────────────────────────────────

describe('STANDARD_TERMS', () => {
  it('contains exactly 11 terms', () => {
    expect(STANDARD_TERMS).toHaveLength(11);
  });

  it('terms are numbered sequentially 1 through 11', () => {
    STANDARD_TERMS.forEach((term, i) => {
      expect(term.number).toBe(i + 1);
    });
  });

  it('every term has a non-empty title', () => {
    STANDARD_TERMS.forEach((term) => {
      expect(term.title.length).toBeGreaterThan(0);
    });
  });

  it('every term has non-empty body text', () => {
    STANDARD_TERMS.forEach((term) => {
      expect(term.text.length).toBeGreaterThan(50);
    });
  });

  it('term 9 is Governing Law and Jurisdiction', () => {
    expect(STANDARD_TERMS[8].title).toMatch(/governing law/i);
  });

  it('term 9 contains [Governing Law] placeholder', () => {
    expect(STANDARD_TERMS[8].text).toContain('[Governing Law]');
  });

  it('term 9 contains [Jurisdiction] placeholder', () => {
    expect(STANDARD_TERMS[8].text).toContain('[Jurisdiction]');
  });

  it('no other term contains placeholders', () => {
    STANDARD_TERMS.filter((t) => t.number !== 9).forEach((term) => {
      expect(term.text).not.toContain('[Governing Law]');
      expect(term.text).not.toContain('[Jurisdiction]');
    });
  });
});
