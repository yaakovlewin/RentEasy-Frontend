'use client';

import { usePathname } from 'next/navigation';

interface DynamicLayoutProps {
  children: React.ReactNode;
}

export function DynamicLayout({ children }: DynamicLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return <main className={`flex-1 ${isHomePage ? '' : 'pt-16 lg:pt-20'}`}>{children}</main>;
}
