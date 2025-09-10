'use client';

import { usePathname } from 'next/navigation';

import { Header } from './Header';

export function DynamicHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return <Header transparent={isHomePage} showScrollSearch={isHomePage} />;
}
