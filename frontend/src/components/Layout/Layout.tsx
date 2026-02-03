import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CompareDrawer from '../CompareDrawer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 transition-colors">
      <div className="relative min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CompareDrawer />
      </div>
    </div>
  );
};

export default Layout;
