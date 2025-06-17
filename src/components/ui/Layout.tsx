import Footer from './footer';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => (
  <div className={`min-h-screen flex flex-col bg-[#f8fafc] ${className ?? ''}`}>
    <main className="flex-1 w-full flex flex-col items-center justify-start">
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
