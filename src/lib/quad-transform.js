const solve = (inputA, inputB) => {
  const n = inputB.length;
  const M = inputA.map((row, i) => row.concat([inputB[i]]));
  for (let i = 0; i < n; i += 1) {
    let best = i;
    for (let k = i + 1; k < n; k += 1) {
      if (Math.abs(M[k][i]) > Math.abs(M[best][i])) best = k;
    }
    [M[i], M[best]] = [M[best], M[i]];
    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-10) return null;
    for (let j = i; j <= n; j += 1) M[i][j] /= pivot;
    for (let k = 0; k < n; k += 1) {
      if (k === i) continue;
      const factor = M[k][i];
      for (let j = i; j <= n; j += 1) M[k][j] -= factor * M[i][j];
    }
  }
  return M.map((row) => row[n]);
};

export const lerpPoint = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const lerpQuad = (from, to, t) => from.map((point, index) => lerpPoint(point, to[index], t));

export const viewportQuad = (width, height) => ([
  { x: 0, y: 0 },
  { x: width, y: 0 },
  { x: width, y: height },
  { x: 0, y: height },
]);

export const matrix3dToQuad = (width, height, dest) => {
  const src = viewportQuad(width, height);
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i += 1) {
    const s = src[i];
    const d = dest[i];
    A.push([s.x, s.y, 1, 0, 0, 0, -s.x * d.x, -s.y * d.x]);
    A.push([0, 0, 0, s.x, s.y, 1, -s.x * d.y, -s.y * d.y]);
    b.push(d.x, d.y);
  }
  const h = solve(A, b);
  if (!h) return 'none';
  const [h0, h1, h2, h3, h4, h5, h6, h7] = h;
  return `matrix3d(${h0},${h3},0,${h6},${h1},${h4},0,${h7},0,0,1,0,${h2},${h5},0,1)`;
};
