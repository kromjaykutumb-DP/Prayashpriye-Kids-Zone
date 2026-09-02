import { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
