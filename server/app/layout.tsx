import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planning Poker API',
  description: 'Backend API for Planning Poker application',
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