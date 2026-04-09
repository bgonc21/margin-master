import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../hooks/useAuth';

export const metadata: Metadata = {
  title: 'Margin Master — NFL Margin Prediction Game',
  description: 'Pick one city per week. Win by the biggest margin. Rule the season.',
  openGraph: {
    title: 'Margin Master',
    description: 'The NFL margin prediction game. Win $250 this season.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
