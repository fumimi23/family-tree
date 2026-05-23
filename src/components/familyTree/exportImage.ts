function cloneSvgForExport(
  svgEl: SVGSVGElement,
  width: number,
  height: number,
): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', width.toString());
  clone.setAttribute('height', height.toString());
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return clone;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

export function exportAsSvg(
  svgEl: SVGSVGElement,
  width: number,
  height: number,
  filename: string,
): void {
  const clone = cloneSvgForExport(svgEl, width, height);
  const source = new XMLSerializer().serializeToString(clone);
  const sourceWithHeader = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${source}`;
  const blob = new Blob([sourceWithHeader], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename);
}

export async function exportAsPng(
  svgEl: SVGSVGElement,
  width: number,
  height: number,
  filename: string,
  backgroundColor: string,
): Promise<void> {
  const clone = cloneSvgForExport(svgEl, width, height);
  const source = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.src = svgUrl;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('Canvas 2D コンテキストを取得できませんでした。');
    }
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b === null) {
          reject(new Error('PNG への変換に失敗しました。'));
          return;
        }
        resolve(b);
      }, 'image/png');
    });
    triggerDownload(pngBlob, filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
