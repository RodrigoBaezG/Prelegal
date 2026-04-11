import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NDAForm from '../components/NDAForm';
import { DEFAULT_NDA_DATA, NDAFormData } from '../lib/ndaTemplate';

const BASE: NDAFormData = {
  ...DEFAULT_NDA_DATA,
  effectiveDate: '2026-01-15',
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('NDAForm rendering', () => {
  it('renders all three section headers', () => {
    render(<NDAForm data={BASE} onChange={jest.fn()} />);
    expect(screen.getByText('Agreement Terms')).toBeInTheDocument();
    expect(screen.getByText('Party 1')).toBeInTheDocument();
    expect(screen.getByText('Party 2')).toBeInTheDocument();
  });

  it('renders the purpose textarea with the current value', () => {
    render(<NDAForm data={{ ...BASE, purpose: 'My test purpose' }} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('My test purpose')).toBeInTheDocument();
  });

  it('renders the effective date input', () => {
    render(<NDAForm data={{ ...BASE, effectiveDate: '2026-01-15' }} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('2026-01-15')).toBeInTheDocument();
  });

  it('renders the governing law input with its value', () => {
    render(<NDAForm data={{ ...BASE, governingLaw: 'Delaware' }} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('Delaware')).toBeInTheDocument();
  });

  it('renders the jurisdiction input with its value', () => {
    render(<NDAForm data={{ ...BASE, jurisdiction: 'Wilmington, DE' }} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('Wilmington, DE')).toBeInTheDocument();
  });

  it('renders the modifications textarea', () => {
    render(<NDAForm data={{ ...BASE, modifications: 'Section 5 waived.' }} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('Section 5 waived.')).toBeInTheDocument();
  });

  it('renders party 1 name input', () => {
    render(<NDAForm data={{ ...BASE, party1Name: 'Alice Smith' }} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('Alice Smith')).toBeInTheDocument();
  });

  it('renders party 2 company input', () => {
    render(<NDAForm data={{ ...BASE, party2Company: 'Beta Inc' }} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('Beta Inc')).toBeInTheDocument();
  });

  it('renders party 1 notice address input', () => {
    render(<NDAForm data={{ ...BASE, party1NoticeAddress: 'alice@acme.com' }} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('alice@acme.com')).toBeInTheDocument();
  });
});

// ─── MNDA Term radio buttons ──────────────────────────────────────────────────

describe('NDAForm MNDA term radio buttons', () => {
  it('expires radio is checked when mndaTermType is expires', () => {
    render(<NDAForm data={{ ...BASE, mndaTermType: 'expires' }} onChange={jest.fn()} />);
    const radios = screen.getAllByRole('radio');
    const expiresRadio = radios.find((r) => (r as HTMLInputElement).value === 'expires');
    expect(expiresRadio).toBeChecked();
  });

  it('continues radio is checked when mndaTermType is continues', () => {
    render(<NDAForm data={{ ...BASE, mndaTermType: 'continues' }} onChange={jest.fn()} />);
    const radios = screen.getAllByRole('radio');
    const continuesRadio = radios.find((r) => (r as HTMLInputElement).value === 'continues');
    expect(continuesRadio).toBeChecked();
  });

  it('MNDA term years input is enabled when mndaTermType is expires', () => {
    render(<NDAForm data={{ ...BASE, mndaTermType: 'expires' }} onChange={jest.fn()} />);
    expect(screen.getByRole('spinbutton', { name: /mnda term years/i })).not.toBeDisabled();
  });

  it('MNDA term years input is disabled when mndaTermType is continues', () => {
    render(<NDAForm data={{ ...BASE, mndaTermType: 'continues' }} onChange={jest.fn()} />);
    expect(screen.getByRole('spinbutton', { name: /mnda term years/i })).toBeDisabled();
  });

  it('renders the current mndaTermYears value in the input', () => {
    render(<NDAForm data={{ ...BASE, mndaTermType: 'expires', mndaTermYears: '5' }} onChange={jest.fn()} />);
    expect(screen.getByRole('spinbutton', { name: /mnda term years/i })).toHaveValue(5);
  });
});

// ─── Confidentiality term radio buttons ──────────────────────────────────────

describe('NDAForm confidentiality term radio buttons', () => {
  it('years radio is checked when confidentialityTermType is years', () => {
    render(<NDAForm data={{ ...BASE, confidentialityTermType: 'years' }} onChange={jest.fn()} />);
    const radios = screen.getAllByRole('radio');
    const yearsRadio = radios.find((r) => (r as HTMLInputElement).value === 'years');
    expect(yearsRadio).toBeChecked();
  });

  it('perpetuity radio is checked when confidentialityTermType is perpetuity', () => {
    render(<NDAForm data={{ ...BASE, confidentialityTermType: 'perpetuity' }} onChange={jest.fn()} />);
    const radios = screen.getAllByRole('radio');
    const perpetuityRadio = radios.find((r) => (r as HTMLInputElement).value === 'perpetuity');
    expect(perpetuityRadio).toBeChecked();
  });

  it('confidentiality years input is enabled when confidentialityTermType is years', () => {
    render(<NDAForm data={{ ...BASE, confidentialityTermType: 'years' }} onChange={jest.fn()} />);
    expect(screen.getByRole('spinbutton', { name: /confidentiality term years/i })).not.toBeDisabled();
  });

  it('confidentiality years input is disabled when confidentialityTermType is perpetuity', () => {
    render(<NDAForm data={{ ...BASE, confidentialityTermType: 'perpetuity' }} onChange={jest.fn()} />);
    expect(screen.getByRole('spinbutton', { name: /confidentiality term years/i })).toBeDisabled();
  });
});

// ─── onChange callbacks ───────────────────────────────────────────────────────

// onChange tests use fireEvent.change because NDAForm is a purely controlled component:
// userEvent.type() fires character-by-character, but since the parent mock never updates
// the data prop, each character sees an empty input and only the last char accumulates.
// fireEvent.change simulates a single change event with the full value, matching real usage.
describe('NDAForm onChange callbacks', () => {
  it('calls onChange with updated purpose', () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, purpose: '' }} onChange={onChange} />);
    const textarea = screen.getByLabelText(/purpose/i);
    fireEvent.change(textarea, { target: { value: 'New purpose' } });
    const lastCall = onChange.mock.calls.at(-1)[0] as NDAFormData;
    expect(lastCall.purpose).toBe('New purpose');
  });

  it('calls onChange with updated governingLaw', () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, governingLaw: '' }} onChange={onChange} />);
    const input = screen.getByLabelText(/governing law/i);
    fireEvent.change(input, { target: { value: 'Texas' } });
    const lastCall = onChange.mock.calls.at(-1)[0] as NDAFormData;
    expect(lastCall.governingLaw).toBe('Texas');
  });

  it('calls onChange with updated jurisdiction', () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, jurisdiction: '' }} onChange={onChange} />);
    const input = screen.getByLabelText(/jurisdiction/i);
    fireEvent.change(input, { target: { value: 'Austin, TX' } });
    const lastCall = onChange.mock.calls.at(-1)[0] as NDAFormData;
    expect(lastCall.jurisdiction).toBe('Austin, TX');
  });

  it('calls onChange with mndaTermType continues when radio clicked', async () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, mndaTermType: 'expires' }} onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    const continuesRadio = radios.find((r) => (r as HTMLInputElement).value === 'continues')!;
    await userEvent.click(continuesRadio);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ mndaTermType: 'continues' }));
  });

  it('calls onChange with mndaTermType expires when radio clicked', async () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, mndaTermType: 'continues' }} onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    const expiresRadio = radios.find((r) => (r as HTMLInputElement).value === 'expires')!;
    await userEvent.click(expiresRadio);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ mndaTermType: 'expires' }));
  });

  it('calls onChange with confidentialityTermType perpetuity when radio clicked', async () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, confidentialityTermType: 'years' }} onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    const perpetuityRadio = radios.find((r) => (r as HTMLInputElement).value === 'perpetuity')!;
    await userEvent.click(perpetuityRadio);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ confidentialityTermType: 'perpetuity' })
    );
  });

  it('calls onChange with updated mndaTermYears', () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, mndaTermType: 'expires', mndaTermYears: '1' }} onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton', { name: /mnda term years/i }), { target: { value: '5' } });
    const lastCall = onChange.mock.calls.at(-1)[0] as NDAFormData;
    expect(lastCall.mndaTermYears).toBe('5');
  });

  it('calls onChange with updated party1Name', () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, party1Name: '' }} onChange={onChange} />);
    const inputs = screen.getAllByLabelText(/full name/i);
    fireEvent.change(inputs[0], { target: { value: 'Jane' } });
    const lastCall = onChange.mock.calls.at(-1)[0] as NDAFormData;
    expect(lastCall.party1Name).toBe('Jane');
  });

  it('calls onChange with updated party2Company', () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, party2Company: '' }} onChange={onChange} />);
    const inputs = screen.getAllByLabelText(/company/i);
    fireEvent.change(inputs[1], { target: { value: 'Gamma LLC' } });
    const lastCall = onChange.mock.calls.at(-1)[0] as NDAFormData;
    expect(lastCall.party2Company).toBe('Gamma LLC');
  });

  it('calls onChange with updated modifications', () => {
    const onChange = jest.fn();
    render(<NDAForm data={{ ...BASE, modifications: '' }} onChange={onChange} />);
    const textarea = screen.getByLabelText(/mnda modifications/i);
    fireEvent.change(textarea, { target: { value: 'Section 5 waived.' } });
    const lastCall = onChange.mock.calls.at(-1)[0] as NDAFormData;
    expect(lastCall.modifications).toBe('Section 5 waived.');
  });

  it('preserves all other fields when one field changes', () => {
    const onChange = jest.fn();
    const fullData: NDAFormData = {
      ...BASE,
      party1Company: 'Acme',
      party2Company: 'Beta',
      governingLaw: '',
    };
    render(<NDAForm data={fullData} onChange={onChange} />);
    const input = screen.getByLabelText(/governing law/i);
    fireEvent.change(input, { target: { value: 'X' } });
    const lastCall = onChange.mock.calls.at(-1)[0] as NDAFormData;
    expect(lastCall.party1Company).toBe('Acme');
    expect(lastCall.party2Company).toBe('Beta');
  });
});
