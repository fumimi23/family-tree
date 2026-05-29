import React from 'react';

import { exportAsPng, exportAsSvg } from '@/components/familyTree/exportImage';
import { toaster } from '@/components/ui/toaster';

interface LayoutSize {
  width: number;
  height: number;
}

interface ExportHandlers {
  svgRef: React.RefObject<SVGSVGElement | null>;
  handleExportSvg: () => void;
  handleExportPng: () => void;
}

/*
 * FamilyTree の SVG/PNG エクスポート用ハンドラを切り出したフック。
 * 親コンポーネントの行数制限 (max-lines) を守るため独立させている。
 */
export function useFamilyTreeExport(layout: LayoutSize | null): ExportHandlers {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const handleExportSvg = React.useCallback((): void => {
    if (svgRef.current === null || layout === null) {
      return;
    }
    exportAsSvg(svgRef.current, layout.width, layout.height, 'family-tree.svg');
  }, [layout]);
  const handleExportPng = React.useCallback((): void => {
    if (svgRef.current === null || layout === null) {
      return;
    }
    void exportAsPng(
      svgRef.current,
      layout.width,
      layout.height,
      'family-tree.png',
      '#ffffff',
    ).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toaster.create({
        title: 'PNG エクスポートに失敗しました。',
        description: message,
        type: 'error',
      });
    });
  }, [layout]);
  return {
    svgRef,
    handleExportSvg,
    handleExportPng,
  };
}
