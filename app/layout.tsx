import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Malta Sells - Find Your Dream Property',
  description: 'Discover the best properties for sale in Malta',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}