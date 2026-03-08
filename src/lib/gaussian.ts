export interface Step {
  operations: string[];
  matrix: number[][];
  changedRows?: number[];
  isFinal?: boolean;
}

// Fraction representation: [numerator, denominator]
type Frac = [number, number];

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function fracSimplify([n, d]: Frac): Frac {
  if (d < 0) { n = -n; d = -d; }
  if (n === 0) return [0, 1];
  const g = gcd(Math.abs(n), d);
  return [n / g, d / g];
}

function fracFromNum(x: number): Frac {
  if (Number.isInteger(x)) return [x, 1];
  const tol = 1e-9;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = x;
  for (let i = 0; i < 100; i++) {
    const a = Math.floor(b);
    let h = a * h1 + h2;
    let k = a * k1 + k2;
    h2 = h1; h1 = h;
    k2 = k1; k1 = k;
    if (Math.abs(x - h / k) < tol) return fracSimplify([h, k]);
    if (Math.abs(b - a) < tol) break;
    b = 1 / (b - a);
  }
  return fracSimplify([h1, k1]);
}

function fracMul([n1, d1]: Frac, [n2, d2]: Frac): Frac {
  return fracSimplify([n1 * n2, d1 * d2]);
}

function fracDiv([n1, d1]: Frac, [n2, d2]: Frac): Frac {
  return fracSimplify([n1 * d2, d1 * n2]);
}

function fracSub([n1, d1]: Frac, [n2, d2]: Frac): Frac {
  return fracSimplify([n1 * d2 - n2 * d1, d1 * d2]);
}

function fracAdd([n1, d1]: Frac, [n2, d2]: Frac): Frac {
  return fracSimplify([n1 * d2 + n2 * d1, d1 * d2]);
}

function fracToStr([n, d]: Frac): string {
  if (d === 1) return n.toString();
  return `${n}/${d}`;
}

function fracToNum([n, d]: Frac): number {
  return n / d;
}

function fracIsZero([n]: Frac): boolean {
  return n === 0;
}

function fracAbs([n, d]: Frac): number {
  return Math.abs(n / d);
}

function fracMatrixToNum(m: Frac[][]): number[][] {
  return m.map(r => r.map(f => fracToNum(f)));
}

export function formatNum(n: number): string {
  const f = fracFromNum(n);
  return fracToStr(f);
}

export function gaussianElimination(input: number[][]): Step[] {
  const steps: Step[] = [];
  const rows = input.length;
  const cols = input[0].length;
  const m: Frac[][] = input.map(r => r.map(v => fracFromNum(v)));

  let pivotRow = 0;

  for (let col = 0; col < cols - 1 && pivotRow < rows; col++) {
    // Find first non-zero in this column at or below pivotRow
    let maxIdx = -1;
    for (let i = pivotRow; i < rows; i++) {
      if (!fracIsZero(m[i][col])) {
        if (maxIdx === -1 || fracAbs(m[i][col]) > fracAbs(m[maxIdx][col])) {
          maxIdx = i;
        }
      }
    }

    if (maxIdx === -1) continue;

    // Swap if needed
    if (maxIdx !== pivotRow) {
      [m[pivotRow], m[maxIdx]] = [m[maxIdx], m[pivotRow]];
      steps.push({
        operations: [`R${pivotRow + 1} ↔ R${maxIdx + 1}`],
        matrix: fracMatrixToNum(m),
        changedRows: [pivotRow, maxIdx],
      });
    }

    // Eliminate all rows below the pivot - group into one step
    const ops: string[] = [];
    const changed: number[] = [];
    const pivot = m[pivotRow][col];

    for (let i = pivotRow + 1; i < rows; i++) {
      if (fracIsZero(m[i][col])) continue;

      const target = m[i][col];
      // Compute factor: we want to do R_i = R_i - (target/pivot) * R_pivotRow
      // To keep integers, if pivot divides target evenly, use integer multiple
      const [pn, pd] = pivot;
      const [tn, td] = target;
      
      // factor = target / pivot
      const factor = fracDiv(target, pivot);
      const [fn, fd] = factor;

      if (fd === 1) {
        // Integer factor - nice clean operation
        if (fn > 0) {
          ops.push(fn === 1
            ? `R${i + 1} → R${i + 1} − R${pivotRow + 1}`
            : `R${i + 1} → R${i + 1} − ${fn}R${pivotRow + 1}`);
        } else {
          const abs = Math.abs(fn);
          ops.push(abs === 1
            ? `R${i + 1} → R${i + 1} + R${pivotRow + 1}`
            : `R${i + 1} → R${i + 1} + ${abs}R${pivotRow + 1}`);
        }
      } else {
        // Fractional factor
        if (fn > 0) {
          ops.push(`R${i + 1} → R${i + 1} − (${fracToStr(factor)})R${pivotRow + 1}`);
        } else {
          const neg: Frac = [-fn, fd];
          ops.push(`R${i + 1} → R${i + 1} + (${fracToStr(neg)})R${pivotRow + 1}`);
        }
      }

      for (let j = 0; j < cols; j++) {
        m[i][j] = fracSub(m[i][j], fracMul(factor, m[pivotRow][j]));
      }
      changed.push(i);
    }

    if (ops.length > 0) {
      steps.push({
        operations: ops,
        matrix: fracMatrixToNum(m),
        changedRows: changed,
      });
    }

    // Scale pivot row to make pivot = 1 (if not already 1)
    const currentPivot = m[pivotRow][col];
    if (currentPivot[0] !== currentPivot[1]) {
      // Check if it's -1
      if (currentPivot[0] === -1 && currentPivot[1] === 1) {
        for (let j = 0; j < cols; j++) {
          m[pivotRow][j] = fracMul(m[pivotRow][j], [-1, 1]);
        }
        steps.push({
          operations: [`R${pivotRow + 1} → −R${pivotRow + 1}`],
          matrix: fracMatrixToNum(m),
          changedRows: [pivotRow],
        });
      } else if (!fracIsZero(currentPivot)) {
        const divisor = fracToStr(currentPivot);
        for (let j = 0; j < cols; j++) {
          m[pivotRow][j] = fracDiv(m[pivotRow][j], currentPivot);
        }
        steps.push({
          operations: [`R${pivotRow + 1} → R${pivotRow + 1} / ${divisor}`],
          matrix: fracMatrixToNum(m),
          changedRows: [pivotRow],
        });
      }
    }

    pivotRow++;
  }

  return steps;
}
