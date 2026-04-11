import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../app/page';

// ─── Layout ───────────────────────────────────────────────────────────────────

describe('Home page layout', () => {
  it('renders the Prelegal header', () => {
    render(<Home />);
    expect(screen.getByText('Prelegal')).toBeInTheDocument();
  });

  it('renders the Mutual NDA Creator subtitle in the header', () => {
    render(<Home />);
    expect(screen.getByText('Mutual NDA Creator')).toBeInTheDocument();
  });

  it('renders the form column', () => {
    render(<Home />);
    expect(screen.getByText('Agreement Terms')).toBeInTheDocument();
    // 'Party 1' and 'Party 2' also appear in the preview signature table, so use getAllByText
    expect(screen.getAllByText('Party 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Party 2').length).toBeGreaterThan(0);
  });

  it('renders the preview column with the document title', () => {
    render(<Home />);
    expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument();
  });

  it('renders the Live Preview label', () => {
    render(<Home />);
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('renders the Download PDF button from the start', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });
});

// ─── Live preview updates ─────────────────────────────────────────────────────

describe('Home page live preview', () => {
  it('preview shows the default purpose text on initial render', () => {
    render(<Home />);
    // Default purpose appears in the preview cover page
    expect(
      screen.getAllByText(/evaluating whether to enter into a business relationship/i).length
    ).toBeGreaterThan(0);
  });

  it('preview updates when governing law is typed', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const govInput = screen.getByLabelText(/governing law/i);
    await user.type(govInput, 'Oregon');
    // Governing Law appears in the cover page of the preview
    expect(screen.getAllByText(/oregon/i).length).toBeGreaterThan(0);
  });

  it('preview updates when party 1 name is typed', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const nameInputs = screen.getAllByLabelText(/full name/i);
    await user.type(nameInputs[0], 'Carol');
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });

  it('preview updates when party 2 company is typed', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const companyInputs = screen.getAllByLabelText(/company/i);
    await user.type(companyInputs[1], 'Gamma LLC');
    expect(screen.getByText('Gamma LLC')).toBeInTheDocument();
  });

  it('preview shows blank placeholder before party 1 name is entered', () => {
    render(<Home />);
    // party1Name is empty by default
    expect(screen.getAllByText('_______________').length).toBeGreaterThan(0);
  });

  it('blank placeholder disappears once party 1 name is entered', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const initialBlanks = screen.getAllByText('_______________').length;
    // The party1 name input has id="party1-name"; select it via its associated label "Full Name"
    const nameInputs = screen.getAllByLabelText(/full name/i);
    await user.type(nameInputs[0], 'Alice');
    const afterBlanks = screen.getAllByText('_______________').length;
    expect(afterBlanks).toBeLessThan(initialBlanks);
  });

  it('switching MNDA term to continues updates the preview text', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const radios = screen.getAllByRole('radio');
    const continuesRadio = radios.find(
      (r) => (r as HTMLInputElement).value === 'continues'
    )!;
    await user.click(continuesRadio);
    expect(screen.getByText(/continues until terminated/i)).toBeInTheDocument();
  });

  it('switching confidentiality term to perpetuity updates the preview', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const radios = screen.getAllByRole('radio');
    const perpetuityRadio = radios.find(
      (r) => (r as HTMLInputElement).value === 'perpetuity'
    )!;
    await user.click(perpetuityRadio);
    expect(screen.getByText('In perpetuity.')).toBeInTheDocument();
  });
});
