import React from 'react';

const WHEEL_COOLDOWN_MS = 80;

interface Options {
  containerRef: React.RefObject<HTMLDivElement | null>;
  enabled: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function useWheelZoom({
  containerRef,
  enabled,
  onZoomIn,
  onZoomOut,
}: Options): void {
  const lastTimeRef = React.useRef(0);
  React.useEffect(() => {
    const el = containerRef.current;
    if (!enabled || el === null) {
      return undefined;
    }
    const handleWheel = (e: WheelEvent): void => {
      if (!e.ctrlKey && !e.metaKey) {
        return;
      }
      e.preventDefault();
      const now = performance.now();
      if (now - lastTimeRef.current < WHEEL_COOLDOWN_MS) {
        return;
      }
      lastTimeRef.current = now;
      if (e.deltaY < 0) {
        onZoomIn();
      } else if (e.deltaY > 0) {
        onZoomOut();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return (): void => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, enabled, onZoomIn, onZoomOut]);
}
