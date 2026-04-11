import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prelegal — Mutual NDA Creator',
  description: 'Generate a Mutual Non-Disclosure Agreement in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
