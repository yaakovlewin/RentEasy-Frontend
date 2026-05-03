import { useEffect, useState } from 'react';

interface PortalSlots {
  heroSlot: HTMLElement | null;
  headerSlot: HTMLElement | null;
  mounted: boolean;
}

export const usePortalSlots = (): PortalSlots => {
  const [mounted, setMounted] = useState(false);
  const [heroSlot, setHeroSlot] = useState<HTMLElement | null>(null);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const heroContainer = document.getElementById('search-hero-slot');
    const headerContainer = document.getElementById('search-header-slot');

    setHeroSlot(heroContainer);
    setHeaderSlot(headerContainer);
  }, []);

  return { heroSlot, headerSlot, mounted };
};
