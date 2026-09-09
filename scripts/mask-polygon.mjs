import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [input, output, widthArg, heightArg, pointsArg] = process.argv.slice(2);

if (!input || !output || !widthArg || !heightArg || !pointsArg) {
  throw new Error('Usage: node scripts/mask-polygon.mjs input output width height "x,y x,y ..."');
}

const width = Number(widthArg);
const height = Number(heightArg);
const points = pointsArg.split(' ').map((point) => point.split(',').map(Number));
const ffmpeg = '/opt/homebrew/bin/ffmpeg';
const pixels = execFileSync(ffmpeg, [
  '-loglevel', 'error',
  '-i', input,
  '-f', 'rawvideo',
  '-pix_fmt', 'rgba',
  'pipe:1',
], { maxBuffer: 128 * 1024 * 1024 });

const isInside = (sampleX, sampleY) => {
  let inside = false;

  for (let current = 0, previous = points.length - 1; current < points.length; previous = current, current += 1) {
    const [currentX, currentY] = points[current];
    const [previousX, previousY] = points[previous];
    const crossesEdge = (currentY > sampleY) !== (previousY > sampleY);
    const intersectionX = ((previousX - currentX) * (sampleY - currentY)) / (previousY - currentY) + currentX;
    if (crossesEdge && sampleX < intersectionX) inside = !inside;
  }

  return inside;
};

const samples = [0.125, 0.375, 0.625, 0.875];
let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let pixelY = 0; pixelY < height; pixelY += 1) {
  for (let pixelX = 0; pixelX < width; pixelX += 1) {
    let insideSamples = 0;
    for (const sampleY of samples) {
      for (const sampleX of samples) {
        if (isInside(pixelX + sampleX, pixelY + sampleY)) insideSamples += 1;
      }
    }

    const offset = (pixelY * width + pixelX) * 4;
    pixels[offset + 3] = Math.round(pixels[offset + 3] * insideSamples / (samples.length ** 2));
    if (pixels[offset + 3] === 0) continue;
    minX = Math.min(minX, pixelX);
    minY = Math.min(minY, pixelY);
    maxX = Math.max(maxX, pixelX);
    maxY = Math.max(maxY, pixelY);
  }
}

if (maxX < minX || maxY < minY) throw new Error('Polygon did not include any visible pixels.');

const padding = 2;
minX = Math.max(0, minX - padding);
minY = Math.max(0, minY - padding);
maxX = Math.min(width - 1, maxX + padding);
maxY = Math.min(height - 1, maxY + padding);

const outputWidth = maxX - minX + 1;
const outputHeight = maxY - minY + 1;
const trimmedPixels = Buffer.alloc(outputWidth * outputHeight * 4);

for (let outputY = 0; outputY < outputHeight; outputY += 1) {
  const sourceStart = ((minY + outputY) * width + minX) * 4;
  const sourceEnd = sourceStart + outputWidth * 4;
  pixels.copy(trimmedPixels, outputY * outputWidth * 4, sourceStart, sourceEnd);
}

mkdirSync(dirname(output), { recursive: true });
execFileSync(ffmpeg, [
  '-y',
  '-loglevel', 'error',
  '-f', 'rawvideo',
  '-pix_fmt', 'rgba',
  '-s', `${outputWidth}x${outputHeight}`,
  '-i', 'pipe:0',
  '-frames:v', '1',
  output,
], { input: trimmedPixels, maxBuffer: 128 * 1024 * 1024 });

console.log(`${output}: ${outputWidth}x${outputHeight}`);
