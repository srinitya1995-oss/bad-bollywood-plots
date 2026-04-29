import { useLayoutEffect, useState, type RefObject } from 'react';

/** Result of useCardTextFit: the resolved font size and whether the long-card
 * branch is active. When `compact` is true, the caller should switch the body
 * style from italic Fraunces to upright Fraunces so that the readability floor
 * is preserved for the elder cohort (panel P1-8). */
export interface CardTextFit {
  fontSize: number;
  /** True when the auto-fit had to drop to (or near) the minimum size. */
  compact: boolean;
}

/**
 * Auto-fit text size within a fixed-height container.
 * Steps down from maxSize to minSize until the text no longer overflows.
 * The minimum is floored at 14px so long cards stay legible for the
 * aunty / mom cohort (simulator P0 row 3, panel P1-8).
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
    // Treat the bottom 2px of the range as "compact" so the upright fallback
    // kicks in before we hit absolute floor and lose any more legibility.
    const compact = best <= minSize + 2;
    setFit({ fontSize: best, compact });
  }, [text, containerRef, maxSize, minSize]);

  return fit;
}
