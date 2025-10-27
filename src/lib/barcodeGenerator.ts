import JsBarcode from 'jsbarcode';

export class BarcodeGenerator {
  static generate(data: string): string {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, data, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 14,
      textMargin: 5,
    });
    return canvas.toDataURL();
  }

  static generateSVG(data: string): string {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, data, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 14,
      textMargin: 5,
    });
    return new XMLSerializer().serializeToString(svg);
  }
}