import { GeoTiff } from './types';

export function renderRGB(rgb: GeoTiff, mask?: GeoTiff): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = mask ? mask.width : rgb.width;
  canvas.height = mask ? mask.height : rgb.height;

  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(canvas.width, canvas.height);

  const dw = rgb.width / canvas.width;
  const dh = rgb.height / canvas.height;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const rgbIdx = Math.floor(y * dh) * rgb.width + Math.floor(x * dw);
      const maskIdx = y * canvas.width + x;
      const imgIdx = y * canvas.width * 4 + x * 4;

      // RGB values from the three bands
      img.data[imgIdx + 0] = rgb.rasters[0][rgbIdx]; // Red
      img.data[imgIdx + 1] = rgb.rasters[1][rgbIdx]; // Green
      img.data[imgIdx + 2] = rgb.rasters[2][rgbIdx]; // Blue
      img.data[imgIdx + 3] = mask ? mask.rasters[0][maskIdx] * 255 : 255; // Alpha
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}