import React, { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function MainLayout({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: MainLayoutProps) {
  const user = usePage().props.auth?.user || null;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHeader && <Header user={user} />}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}