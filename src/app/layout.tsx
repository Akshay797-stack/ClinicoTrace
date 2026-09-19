import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClinicoTrace — Zero-Hallucination Clinical Safety',
  description:
    'ClinicoTrace is a clinical safety and patient communication platform for high-volume Indian hospital OPDs. ' +
    'AI extracts. Rules verify. Doctor decides. Patient understands.',
  keywords: ['clinical safety', 'OPD', 'hospital', 'prescription', 'drug interaction', 'patient communication'],
  robots: 'noindex, nofollow', // Clinical system — not for public indexing
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' fill='%231A5FA8'/><path d='M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6z' fill='white'/></svg>" />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
