import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NDAPreview from '../components/NDAPreview';
import { NDAFormData, STANDARD_TERMS } from '../lib/ndaTemplate';

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

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('NDAPreview rendering', () => {
  it('renders the document title', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument();
  });

  it('renders the Live Preview toolbar label', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('renders the download button', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });

  it('renders the purpose text', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getByText('Evaluating a potential partnership')).toBeInTheDocument();
  });

  it('renders party 1 name', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('renders party 2 name', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('renders party 1 company', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
  });

  it('renders party 2 company', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getAllByText('Beta Inc').length).toBeGreaterThan(0);
  });

  it('renders party 1 title', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getAllByText('CEO').length).toBeGreaterThan(0);
  });

  it('renders formatted effective date', () => {
    render(<NDAPreview data={BASE} />);
    // Both effectiveDate and party1Date are 2026-01-15, so multiple matches are expected
    expect(screen.getAllByText('January 15, 2026').length).toBeGreaterThanOrEqual(1);
  });

  it('renders formatted party 1 date', () => {
    render(<NDAPreview data={{ ...BASE, party1Date: '2026-03-01' }} />);
    expect(screen.getAllByText('March 1, 2026').length).toBeGreaterThan(0);
  });

  it('renders the MNDA term text', () => {
    render(<NDAPreview data={{ ...BASE, mndaTermType: 'expires', mndaTermYears: '2' }} />);
    expect(screen.getByText('Expires 2 year(s) from Effective Date.')).toBeInTheDocument();
  });

  it('renders continues-until-terminated when selected', () => {
    render(<NDAPreview data={{ ...BASE, mndaTermType: 'continues' }} />);
    expect(
      screen.getByText(/continues until terminated/i)
    ).toBeInTheDocument();
  });

  it('renders in perpetuity confidentiality text when selected', () => {
    render(<NDAPreview data={{ ...BASE, confidentialityTermType: 'perpetuity' }} />);
    expect(screen.getByText('In perpetuity.')).toBeInTheDocument();
  });

  it('renders all 11 standard term titles', () => {
    render(<NDAPreview data={BASE} />);
    STANDARD_TERMS.forEach((term) => {
      // Use getAllByText because some term titles may also appear in the body text
      expect(screen.getAllByText(new RegExp(term.title, 'i')).length).toBeGreaterThan(0);
    });
  });

  it('renders the governing law in the cover page', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getAllByText(/california/i).length).toBeGreaterThan(0);
  });

  it('renders blank placeholders for empty party 1 name', () => {
    render(<NDAPreview data={{ ...BASE, party1Name: '' }} />);
    expect(screen.getAllByText('_______________').length).toBeGreaterThan(0);
  });

  it('renders blank placeholder for empty effective date', () => {
    render(<NDAPreview data={{ ...BASE, effectiveDate: '' }} />);
    expect(screen.getByText('_______________')).toBeInTheDocument();
  });

  it('renders modifications when provided', () => {
    render(<NDAPreview data={{ ...BASE, modifications: 'Section 5 is waived.' }} />);
    expect(screen.getByText('Section 5 is waived.')).toBeInTheDocument();
  });

  it('does not render modifications row when empty', () => {
    render(<NDAPreview data={{ ...BASE, modifications: '' }} />);
    expect(screen.queryByText('MNDA Modifications')).not.toBeInTheDocument();
  });

  it('renders notice address for party 1', () => {
    render(<NDAPreview data={BASE} />);
    expect(screen.getByText('alice@acme.com')).toBeInTheDocument();
  });

  it('renders formatted party 2 date', () => {
    render(<NDAPreview data={{ ...BASE, party2Date: '2026-03-20' }} />);
    expect(screen.getAllByText('March 20, 2026').length).toBeGreaterThan(0);
  });

  it('renders Not specified placeholder when governing law is empty', () => {
    render(<NDAPreview data={{ ...BASE, governingLaw: '' }} />);
    expect(screen.getAllByText(/not specified/i).length).toBeGreaterThan(0);
  });
});

// ─── Download button ──────────────────────────────────────────────────────────

describe('NDAPreview download button', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: jest.fn().mockReturnValue('blob:mock-url'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Always restore real timers in case a test installed fake timers and threw before cleanup
    jest.useRealTimers();
  });

  it('appends an iframe to the document body when clicked', () => {
    render(<NDAPreview data={BASE} />);

    const appended: Node[] = [];
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      appended.push(node);
      return node as Node & { [key: string]: unknown };
    });

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    const iframes = appended.filter((n) => (n as HTMLElement).tagName === 'IFRAME');
    expect(iframes.length).toBe(1);
  });

  it('sets the iframe display to none (hidden)', () => {
    render(<NDAPreview data={BASE} />);

    let capturedIframe: HTMLIFrameElement | null = null;
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if ((node as HTMLElement).tagName === 'IFRAME') capturedIframe = node as HTMLIFrameElement;
      return node as Node & { [key: string]: unknown };
    });

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    expect(capturedIframe).not.toBeNull();
    expect((capturedIframe as unknown as HTMLIFrameElement).style.display).toBe('none');
  });

  it('calls URL.createObjectURL with an HTML blob', () => {
    render(<NDAPreview data={BASE} />);
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node as Node & { [key: string]: unknown });

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/html');
  });

  it('sets the iframe src to the blob URL', () => {
    render(<NDAPreview data={BASE} />);

    let capturedIframe: HTMLIFrameElement | null = null;
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if ((node as HTMLElement).tagName === 'IFRAME') capturedIframe = node as HTMLIFrameElement;
      return node as Node & { [key: string]: unknown };
    });

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    expect((capturedIframe as unknown as HTMLIFrameElement)?.src).toBe('blob:mock-url');
  });

  it('calls print on the iframe content window when iframe loads', () => {
    jest.useFakeTimers();
    const mockPrint = jest.fn();
    render(<NDAPreview data={BASE} />);

    let capturedIframe: HTMLIFrameElement | null = null;
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if ((node as HTMLElement).tagName === 'IFRAME') {
        capturedIframe = node as HTMLIFrameElement;
        Object.defineProperty(capturedIframe, 'contentWindow', {
          value: { print: mockPrint },
          writable: true,
        });
        setTimeout(() => capturedIframe?.onload?.(new Event('load')), 0);
      }
      return node as Node & { [key: string]: unknown };
    });
    // removeChild will fail because appendChild is mocked and the iframe was never actually
    // added to the DOM — mock it so the cleanup timer doesn't throw.
    jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    jest.runAllTimers();

    expect(mockPrint).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
