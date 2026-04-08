import type { Metadata } from 'next';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'Operations Hub',
  description: 'Operations Hub — Prototype',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Runs synchronously before React hydrates — eliminates theme flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('hub-theme');if(t!=='light')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
