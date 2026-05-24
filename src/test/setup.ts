import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom には matchMedia がないため、color-mode / next-themes 用に no-op を差し込む。
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    // 古い MediaQueryList API (一部ライブラリが使用)
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

/*
 * jsdom には ResizeObserver もないので最小実装で stub する。
 * `new ResizeObserver(cb)` で構築できるように関数コンストラクタ風に定義する。
 */
const noop = (): void => { /* no-op for ResizeObserver stub */ };
function ResizeObserverStub(): { observe: () => void;
  unobserve: () => void;
  disconnect: () => void; } {
  return {
    observe: noop,
    unobserve: noop,
    disconnect: noop,
  };
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
});

afterEach(() => {
  cleanup();
});
