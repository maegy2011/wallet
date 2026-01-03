'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  
  // Don't use NextAuth SessionProvider for admin routes
  // Admin routes use their own JWT authentication system
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }
  
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}