import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1221] via-[#0f172a] to-[#0b0f1d] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -left-32 -top-20 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute right-0 top-10 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="absolute -bottom-10 left-20 h-[22rem] w-[22rem] rounded-full bg-emerald-400/10 blur-[120px]" />
      </div>

      <div className="relative min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
