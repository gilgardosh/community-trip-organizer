'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the app is in RTL mode
 * @returns 'rtl' | 'ltr'
 */
export function useDirection() {
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    // Check HTML dir attribute
    const htmlDir = document.documentElement.dir;
    if (htmlDir) {
      setDirection(htmlDir as 'rtl' | 'ltr');
      return;
    }

    // Fallback: check computed style
    const computedDir = window.getComputedStyle(document.body).direction;
    setDirection(computedDir as 'rtl' | 'ltr');
  }, []);

  return direction;
}

/**
 * Hook to check if the app is in RTL mode
 * @returns boolean - true if RTL, false if LTR
 */
export function useIsRTL() {
  const direction = useDirection();
  return direction === 'rtl';
}
