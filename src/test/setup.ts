import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom には matchMedia がないため、color-mode / next-themes 用に no-op を差し込む。
Object.defineProperty(window, 'matchMedia', {
  configurable: true,
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
 * jsdom には ResizeObserver がないため、実 API に寄せた最小実装で stub する。
 * 後から `instanceof ResizeObserver` や callback 引数を検査するコードが入っても
 * テストだけ壊れないよう、シグネチャを揃えておく。
 */
class ResizeObserverStub implements ResizeObserver {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  public constructor(_callback: ResizeObserverCallback) {
    // callback は今は未使用。実 API シグネチャに合わせて受け取るだけ。
  }

  public observe(_target: Element, _options?: ResizeObserverOptions): void {
    // no-op
  }

  public unobserve(_target: Element): void {
    // no-op
  }

  public disconnect(): void {
    // no-op
  }
}
Object.defineProperty(window, 'ResizeObserver', {
  configurable: true,
  writable: true,
  value: ResizeObserverStub,
});

/*
 * jsdom の Element には scrollTo が無いため、Chakra v3 / @zag-js の Select が
 * ドロップダウン閉じ際に呼び出して例外になる。no-op で stub しておく。
 */
if (typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = (): void => { /* no-op */ };
}

afterEach(() => {
  cleanup();
});
