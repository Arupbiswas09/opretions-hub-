import type { Metadata } from 'next';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'High-Fidelity UI Kit',
  description: 'Operations Hub Prototypes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
