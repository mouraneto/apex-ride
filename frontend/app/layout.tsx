import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { Navbar } from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'ApexRide | Superbike Track Day Experience',
  description: 'Aluguel de motocicletas esportivas de alta cilindrada em autódromos oficiais com trava de velocidade e telemetria arcade.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-racing-bg text-gray-100">
        <AuthProvider>
          <BookingProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-racing-border bg-racing-bg/80 py-8 text-center text-xs text-gray-500 font-mono no-print">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="font-display tracking-widest text-gray-400">
                  APEXRIDE © 2026 • HIGH PERFORMANCE TRACK PLATFORM
                </span>
                <span>LGPD COMPLIANT • EMERGENCY DATA SECURED</span>
              </div>
            </footer>
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
