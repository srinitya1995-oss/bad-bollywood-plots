import { useLayoutEffect, useState, type RefObject } from 'react';

export interface CardTextFit {
  fontSize: number;
  /** True when the auto-fit had to settle within 2px of the floor — caller can swap italic to upright for legibility. */
  compact: boolean;
}

/**
 * Auto-fit text size within a fixed-height container.
 * Steps down from maxSize to minSize until the text no longer overflows.
 */
export function useCardTextFit(
  text: string,
  containerRef: RefObject<HTMLElement | null>,
  maxSize = 27,
  minSize = 14,
): CardTextFit {
  const [fit, setFit] = useState<CardTextFit>({ fontSize: maxSize, compact: false });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

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
    setFit({ fontSize: best, compact: best <= minSize + 2 });
  }, [text, containerRef, maxSize, minSize]);

  return fit;
}
