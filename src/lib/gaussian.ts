export interface Step {
  operation: string;
  explanation: string;
  matrix: number[][];
  pivotCell?: [number, number];
  changedRows?: number[];
}

export interface Solution {
  type: 'unique' | 'infinite' | 'none';
  variables?: { name: string; value: string }[];
  message?: string;
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

function formatCoeffFrac(f: Frac): string {
  const [n, d] = f;
  if (d === 1) {
    if (n === 1) return "";
    if (n === -1) return "−";
    return fracToStr(f);
  }
  return `(${fracToStr(f)})`;
}

export function extractSolution(matrix: number[][]): Solution {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const numVars = cols - 1;

  // Check for inconsistent rows: [0 0 ... 0 | nonzero]
  for (let i = 0; i < rows; i++) {
    const allZeroCoeffs = matrix[i].slice(0, numVars).every(v => Math.abs(v) < 1e-10);
    const rhs = matrix[i][numVars];
    if (allZeroCoeffs && Math.abs(rhs) > 1e-10) {
      return { type: 'none', message: 'No solution — the system is inconsistent.' };
    }
  }

  // Find pivot columns
  const pivotCols: number[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < numVars; j++) {
      if (Math.abs(matrix[i][j]) > 1e-10) {
        pivotCols.push(j);
        break;
      }
    }
  }

  if (pivotCols.length < numVars) {
    return { type: 'infinite', message: 'Infinitely many solutions — the system has free variables.' };
  }

  // Unique solution
  const variables = [];
  for (let i = 0; i < Math.min(rows, numVars); i++) {
    variables.push({
      name: `x${i + 1}`,
      value: formatNum(Math.abs(matrix[i][cols - 1]) < 1e-10 ? 0 : matrix[i][cols - 1]),
    });
  }

  return { type: 'unique', variables };
}

export function gaussianElimination(input: number[][]): Step[] {
  const steps: Step[] = [];
  const rows = input.length;
  const cols = input[0].length;
  const m: Frac[][] = input.map(r => r.map(v => fracFromNum(v)));

  let pivotRow = 0;

  for (let col = 0; col < cols - 1 && pivotRow < rows; col++) {
    let maxIdx = pivotRow;
    for (let i = pivotRow + 1; i < rows; i++) {
      if (fracAbs(m[i][col]) > fracAbs(m[maxIdx][col])) maxIdx = i;
    }

    if (fracIsZero(m[maxIdx][col])) continue;

    if (maxIdx !== pivotRow) {
      [m[pivotRow], m[maxIdx]] = [m[maxIdx], m[pivotRow]];
      steps.push({
        operation: `R${pivotRow + 1} ↔ R${maxIdx + 1}`,
        explanation: `Swap rows to bring the largest value (${fracToStr(m[pivotRow][col])}) into the pivot position for column ${col + 1}.`,
        matrix: fracMatrixToNum(m),
        pivotCell: [pivotRow, col],
        changedRows: [pivotRow, maxIdx],
      });
    }

    const pivotVal: Frac = [...m[pivotRow][col]];
    if (!(pivotVal[0] === pivotVal[1])) {
      const label = pivotVal[0] === -1 && pivotVal[1] === 1
        ? `R${pivotRow + 1} → −R${pivotRow + 1}`
        : `R${pivotRow + 1} → R${pivotRow + 1} / ${fracToStr(pivotVal)}`;
      for (let j = 0; j < cols; j++) m[pivotRow][j] = fracDiv(m[pivotRow][j], pivotVal);
      steps.push({
        operation: label,
        explanation: `Divide row ${pivotRow + 1} by ${fracToStr(pivotVal)} so the pivot element becomes 1.`,
        matrix: fracMatrixToNum(m),
        pivotCell: [pivotRow, col],
        changedRows: [pivotRow],
      });
    }

    for (let i = pivotRow + 1; i < rows; i++) {
      const factor: Frac = [...m[i][col]];
      if (fracIsZero(factor)) continue;

      for (let j = 0; j < cols; j++) {
        m[i][j] = fracSub(m[i][j], fracMul(factor, m[pivotRow][j]));
      }

      let label: string;
      if (fracToNum(factor) > 0) {
        label = `R${i + 1} → R${i + 1} − ${formatCoeffFrac(factor)}R${pivotRow + 1}`;
      } else {
        const neg: Frac = [-factor[0], factor[1]];
        label = `R${i + 1} → R${i + 1} + ${formatCoeffFrac(neg)}R${pivotRow + 1}`;
      }

      steps.push({
        operation: label,
        explanation: `Eliminate the ${fracToStr(factor)} in row ${i + 1}, column ${col + 1} to create a zero below the pivot.`,
        matrix: fracMatrixToNum(m),
        pivotCell: [pivotRow, col],
        changedRows: [i],
      });
    }

    pivotRow++;
  }

  return steps;
}

export function gaussJordanElimination(input: number[][]): { refSteps: Step[]; rrefSteps: Step[] } {
  const refSteps = gaussianElimination(input);

  const lastMatrix = refSteps.length > 0
    ? refSteps[refSteps.length - 1].matrix
    : input;

  const rows = lastMatrix.length;
  const cols = lastMatrix[0].length;
  const m: Frac[][] = lastMatrix.map(r => r.map(v => fracFromNum(v)));
  const rrefSteps: Step[] = [];

  const pivotCols: number[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const f = m[i][j];
      if (f[0] === 1 && f[1] === 1) {
        pivotCols.push(j);
        break;
      }
    }
  }

  for (let p = pivotCols.length - 1; p >= 0; p--) {
    const col = pivotCols[p];
    const pRow = p;

    for (let i = pRow - 1; i >= 0; i--) {
      const factor: Frac = [...m[i][col]];
      if (fracIsZero(factor)) continue;

      for (let j = 0; j < cols; j++) {
        m[i][j] = fracSub(m[i][j], fracMul(factor, m[pRow][j]));
      }

      let label: string;
      if (fracToNum(factor) > 0) {
        label = `R${i + 1} → R${i + 1} − ${formatCoeffFrac(factor)}R${pRow + 1}`;
      } else {
        const neg: Frac = [-factor[0], factor[1]];
        label = `R${i + 1} → R${i + 1} + ${formatCoeffFrac(neg)}R${pRow + 1}`;
      }

      rrefSteps.push({
        operation: label,
        explanation: `Eliminate the ${fracToStr(factor)} in row ${i + 1}, column ${col + 1} to create a zero above the pivot.`,
        matrix: fracMatrixToNum(m),
        pivotCell: [pRow, col],
        changedRows: [i],
      });
    }
  }

  return { refSteps, rrefSteps };
}
