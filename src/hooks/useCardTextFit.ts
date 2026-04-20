import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Auto-fit text size within a fixed-height container.
 * Steps down from maxSize to minSize until the text no longer overflows.
 */
export function useCardTextFit(
  text: string,
  containerRef: RefObject<HTMLElement | null>,
  maxSize = 27,
  minSize = 16,
): number {
  const [fontSize, setFontSize] = useState(maxSize);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Binary search for the largest font size that fits
    let lo = minSize;
    let hi = maxSize;
    let best = minSize;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      el.style.fontSize = `${mid}px`;

      if (el.scrollHeight <= el.clientHeight) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    el.style.fontSize = '';
    setFontSize(best);
  }, [text, containerRef, maxSize, minSize]);

  return fontSize;
}
