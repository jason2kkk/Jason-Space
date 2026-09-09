import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [input, output, xArg, yArg, widthArg, heightArg, toleranceArg = '48', componentMode = 'all', backgroundHex] = process.argv.slice(2);

if (!input || !output || !widthArg || !heightArg) {
  throw new Error('Usage: node scripts/extract-sticker.mjs input output x y width height [tolerance]');
}

const x = Number(xArg);
const y = Number(yArg);
const width = Number(widthArg);
const height = Number(heightArg);
const tolerance = Number(toleranceArg);
const ffmpeg = '/opt/homebrew/bin/ffmpeg';

const pixels = execFileSync(ffmpeg, [
  '-loglevel', 'error',
  '-i', input,
  '-vf', `crop=${width}:${height}:${x}:${y}`,
  '-f', 'rawvideo',
  '-pix_fmt', 'rgba',
  'pipe:1',
], { maxBuffer: 128 * 1024 * 1024 });

const sampleSize = Math.max(2, Math.min(10, Math.floor(Math.min(width, height) * 0.02)));
const cornerOrigins = [
  [0, 0],
  [width - sampleSize, 0],
  [0, height - sampleSize],
  [width - sampleSize, height - sampleSize],
];

const sampledBackgroundColors = cornerOrigins.map(([originX, originY]) => {
  const channels = [0, 0, 0];
  let samples = 0;

  for (let sampleY = originY; sampleY < originY + sampleSize; sampleY += 1) {
    for (let sampleX = originX; sampleX < originX + sampleSize; sampleX += 1) {
      const offset = (sampleY * width + sampleX) * 4;
      channels[0] += pixels[offset];
      channels[1] += pixels[offset + 1];
      channels[2] += pixels[offset + 2];
      samples += 1;
    }
  }

  return channels.map((channel) => channel / samples);
});

const backgroundColors = backgroundHex
  ? [[1, 3, 5].map((start) => Number.parseInt(backgroundHex.slice(start, start + 2), 16))]
  : sampledBackgroundColors;

const toleranceSquared = tolerance * tolerance;
const pixelCount = width * height;
const removed = new Uint8Array(pixelCount);
const queued = new Uint8Array(pixelCount);
const queue = new Int32Array(pixelCount);
let queueStart = 0;
let queueEnd = 0;

const matchesBackground = (pixelIndex) => {
  const offset = pixelIndex * 4;
  return backgroundColors.some(([red, green, blue]) => {
    const deltaRed = pixels[offset] - red;
    const deltaGreen = pixels[offset + 1] - green;
    const deltaBlue = pixels[offset + 2] - blue;
    return deltaRed * deltaRed + deltaGreen * deltaGreen + deltaBlue * deltaBlue <= toleranceSquared;
  });
};

const enqueue = (pixelIndex) => {
  if (queued[pixelIndex] || !matchesBackground(pixelIndex)) return;
  queued[pixelIndex] = 1;
  queue[queueEnd] = pixelIndex;
  queueEnd += 1;
};

for (let edgeX = 0; edgeX < width; edgeX += 1) {
  enqueue(edgeX);
  enqueue((height - 1) * width + edgeX);
}

for (let edgeY = 0; edgeY < height; edgeY += 1) {
  enqueue(edgeY * width);
  enqueue(edgeY * width + width - 1);
}

while (queueStart < queueEnd) {
  const pixelIndex = queue[queueStart];
  queueStart += 1;
  removed[pixelIndex] = 1;
  const pixelX = pixelIndex % width;
  const pixelY = Math.floor(pixelIndex / width);

  if (pixelX > 0) enqueue(pixelIndex - 1);
  if (pixelX < width - 1) enqueue(pixelIndex + 1);
  if (pixelY > 0) enqueue(pixelIndex - width);
  if (pixelY < height - 1) enqueue(pixelIndex + width);
}

for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
  if (removed[pixelIndex]) pixels[pixelIndex * 4 + 3] = 0;
}

const visited = new Uint8Array(pixelCount);
const componentQueue = new Int32Array(pixelCount);
const minimumComponentSize = Math.max(20, Math.floor(pixelCount * 0.00012));
const largestOnly = componentMode === 'largest';
const componentLabels = largestOnly ? new Uint32Array(pixelCount) : null;
let componentId = 0;
let largestComponentId = 0;
let largestComponentSize = 0;

for (let root = 0; root < pixelCount; root += 1) {
  if (visited[root] || pixels[root * 4 + 3] === 0) continue;
  componentId += 1;
  let componentStart = 0;
  let componentEnd = 1;
  componentQueue[0] = root;
  visited[root] = 1;
  if (componentLabels) componentLabels[root] = componentId;

  while (componentStart < componentEnd) {
    const pixelIndex = componentQueue[componentStart];
    componentStart += 1;
    const pixelX = pixelIndex % width;
    const pixelY = Math.floor(pixelIndex / width);
    const neighbors = [];
    if (pixelX > 0) neighbors.push(pixelIndex - 1);
    if (pixelX < width - 1) neighbors.push(pixelIndex + 1);
    if (pixelY > 0) neighbors.push(pixelIndex - width);
    if (pixelY < height - 1) neighbors.push(pixelIndex + width);

    for (const neighbor of neighbors) {
      if (visited[neighbor] || pixels[neighbor * 4 + 3] === 0) continue;
      visited[neighbor] = 1;
      if (componentLabels) componentLabels[neighbor] = componentId;
      componentQueue[componentEnd] = neighbor;
      componentEnd += 1;
    }
  }

  if (largestOnly && componentEnd > largestComponentSize) {
    largestComponentSize = componentEnd;
    largestComponentId = componentId;
  } else if (!largestOnly && componentEnd < minimumComponentSize) {
    for (let componentIndex = 0; componentIndex < componentEnd; componentIndex += 1) {
      pixels[componentQueue[componentIndex] * 4 + 3] = 0;
    }
  }
}

if (largestOnly) {
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (componentLabels[pixelIndex] !== largestComponentId) pixels[pixelIndex * 4 + 3] = 0;
  }
}

let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
  if (pixels[pixelIndex * 4 + 3] === 0) continue;
  const pixelX = pixelIndex % width;
  const pixelY = Math.floor(pixelIndex / width);
  minX = Math.min(minX, pixelX);
  minY = Math.min(minY, pixelY);
  maxX = Math.max(maxX, pixelX);
  maxY = Math.max(maxY, pixelY);
}

if (maxX < minX || maxY < minY) throw new Error(`No foreground found in ${input}`);

const padding = 6;
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
