export interface Step {
  operation: string;
  matrix: number[][];
  pivotCell?: [number, number]; // [row, col] of the pivot used in this step
}

function cloneMatrix(m: number[][]): number[][] {
  return m.map((r) => [...r]);
}

export function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const rounded = parseFloat(n.toFixed(6));
  if (Number.isInteger(rounded)) return rounded.toString();
  return rounded.toString();
}

function formatCoeff(k: number): string {
  if (k === 1) return "";
  if (k === -1) return "−";
  if (k < 0) return `(${formatNum(k)})`;
  return formatNum(k);
}

export function gaussianElimination(input: number[][]): Step[] {
  const steps: Step[] = [];
  const m = cloneMatrix(input);
  const rows = m.length;
  const cols = m[0].length;

  let pivotRow = 0;

  for (let col = 0; col < cols - 1 && pivotRow < rows; col++) {
    // Partial pivoting: find row with largest absolute value in this column
    let maxIdx = pivotRow;
    for (let i = pivotRow + 1; i < rows; i++) {
      if (Math.abs(m[i][col]) > Math.abs(m[maxIdx][col])) maxIdx = i;
    }

    if (Math.abs(m[maxIdx][col]) < 1e-10) continue;

    // Swap rows if needed
    if (maxIdx !== pivotRow) {
      [m[pivotRow], m[maxIdx]] = [m[maxIdx], m[pivotRow]];
      steps.push({
        operation: `R${pivotRow + 1} ↔ R${maxIdx + 1}`,
        matrix: cloneMatrix(m),
        pivotCell: [pivotRow, col],
      });
    }

    // Scale pivot row to make pivot = 1
    const pivotVal = m[pivotRow][col];
    if (Math.abs(pivotVal - 1) > 1e-10) {
      const label =
        pivotVal === -1
          ? `R${pivotRow + 1} → −R${pivotRow + 1}`
          : `R${pivotRow + 1} → R${pivotRow + 1} / ${formatNum(pivotVal)}`;
      for (let j = 0; j < cols; j++) m[pivotRow][j] /= pivotVal;
      steps.push({
        operation: label,
        matrix: cloneMatrix(m),
        pivotCell: [pivotRow, col],
      });
    }

    // Eliminate below
    for (let i = pivotRow + 1; i < rows; i++) {
      const factor = m[i][col];
      if (Math.abs(factor) < 1e-10) continue;

      for (let j = 0; j < cols; j++) m[i][j] -= factor * m[pivotRow][j];

      let label: string;
      if (factor > 0) {
        label = `R${i + 1} → R${i + 1} − ${formatCoeff(factor)}R${pivotRow + 1}`;
      } else {
        label = `R${i + 1} → R${i + 1} + ${formatCoeff(-factor)}R${pivotRow + 1}`;
      }

      steps.push({
        operation: label,
        matrix: cloneMatrix(m),
        pivotCell: [pivotRow, col],
      });
    }

    pivotRow++;
  }

  return steps;
}
