export interface Step {
  operation: string;
  explanation: string; // plain-English explanation of why this step is done
  matrix: number[][];
  pivotCell?: [number, number];
  changedRows?: number[]; // which rows changed in this step
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
    let maxIdx = pivotRow;
    for (let i = pivotRow + 1; i < rows; i++) {
      if (Math.abs(m[i][col]) > Math.abs(m[maxIdx][col])) maxIdx = i;
    }

    if (Math.abs(m[maxIdx][col]) < 1e-10) continue;

    // Swap
    if (maxIdx !== pivotRow) {
      [m[pivotRow], m[maxIdx]] = [m[maxIdx], m[pivotRow]];
      steps.push({
        operation: `R${pivotRow + 1} ↔ R${maxIdx + 1}`,
        explanation: `Swap rows to bring the largest value (${formatNum(m[pivotRow][col])}) into the pivot position for column ${col + 1}. This improves numerical accuracy.`,
        matrix: cloneMatrix(m),
        pivotCell: [pivotRow, col],
        changedRows: [pivotRow, maxIdx],
      });
    }

    // Scale
    const pivotVal = m[pivotRow][col];
    if (Math.abs(pivotVal - 1) > 1e-10) {
      const label =
        pivotVal === -1
          ? `R${pivotRow + 1} → −R${pivotRow + 1}`
          : `R${pivotRow + 1} → R${pivotRow + 1} / ${formatNum(pivotVal)}`;
      for (let j = 0; j < cols; j++) m[pivotRow][j] /= pivotVal;
      steps.push({
        operation: label,
        explanation: `Divide row ${pivotRow + 1} by ${formatNum(pivotVal)} so the pivot element becomes 1. A leading 1 makes elimination easier.`,
        matrix: cloneMatrix(m),
        pivotCell: [pivotRow, col],
        changedRows: [pivotRow],
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
        explanation: `Eliminate the ${formatNum(factor)} in row ${i + 1}, column ${col + 1} to create a zero below the pivot. This clears the column below the leading 1.`,
        matrix: cloneMatrix(m),
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

  const m = refSteps.length > 0
    ? cloneMatrix(refSteps[refSteps.length - 1].matrix)
    : cloneMatrix(input);

  const rows = m.length;
  const cols = m[0].length;
  const rrefSteps: Step[] = [];

  const pivotCols: number[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols - 1; j++) {
      if (Math.abs(m[i][j] - 1) < 1e-10) {
        pivotCols.push(j);
        break;
      }
    }
  }

  for (let p = pivotCols.length - 1; p >= 0; p--) {
    const col = pivotCols[p];
    const pRow = p;

    for (let i = pRow - 1; i >= 0; i--) {
      const factor = m[i][col];
      if (Math.abs(factor) < 1e-10) continue;

      for (let j = 0; j < cols; j++) m[i][j] -= factor * m[pRow][j];

      let label: string;
      if (factor > 0) {
        label = `R${i + 1} → R${i + 1} − ${formatCoeff(factor)}R${pRow + 1}`;
      } else {
        label = `R${i + 1} → R${i + 1} + ${formatCoeff(-factor)}R${pRow + 1}`;
      }

      rrefSteps.push({
        operation: label,
        explanation: `Eliminate the ${formatNum(factor)} in row ${i + 1}, column ${col + 1} to create a zero above the pivot. Back elimination makes each pivot the only non-zero in its column.`,
        matrix: cloneMatrix(m),
        pivotCell: [pRow, col],
        changedRows: [i],
      });
    }
  }

  return { refSteps, rrefSteps };
}
