export const getTargetSlot = (
  isDocked: boolean,
  headerSlot: HTMLElement | null,
  heroSlot: HTMLElement | null
): HTMLElement | null => {
  if (isDocked && headerSlot) return headerSlot;
  if (heroSlot) return heroSlot;
  return null;
};

export const isDebugEnabled = (): boolean =>
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_DEBUG_SEARCH === 'true';
