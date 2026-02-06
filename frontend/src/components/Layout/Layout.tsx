import React, { Suspense, lazy } from 'react';
import Header from './Header';
import Footer from './Footer';

// Lazy-load the compare drawer so it isn't in the eager bundle — it only
// matters once a buyer actually adds products to compare.
const CompareDrawer = lazy(() => import('../CompareDrawer'));

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
        {/* Suspense fallback is null — the drawer renders nothing until loaded */}
        <Suspense fallback={null}>
          <CompareDrawer />
        </Suspense>
      </div>
    </div>
  );
};

export default Layout;
