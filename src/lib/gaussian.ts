export interface Step {
  operation: string;
  matrix: number[][];
}

function cloneMatrix(m: number[][]): number[][] {
  return m.map(r => [...r]);
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(6)).toString();
}

export function gaussianElimination(input: number[][]): Step[] {
  const steps: Step[] = [];
  const m = cloneMatrix(input);
  const rows = m.length;
  const cols = m[0].length;

  let pivotRow = 0;

  for (let col = 0; col < cols && pivotRow < rows; col++) {
    // Find pivot
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
        matrix: cloneMatrix(m),
      });
    }

    // Scale pivot row
    const pivotVal = m[pivotRow][col];
    if (Math.abs(pivotVal - 1) > 1e-10) {
      for (let j = 0; j < cols; j++) m[pivotRow][j] /= pivotVal;
      steps.push({
        operation: `R${pivotRow + 1} → (1/${formatNum(pivotVal)})·R${pivotRow + 1}`,
        matrix: cloneMatrix(m),
      });
    }

    // Eliminate below
    for (let i = pivotRow + 1; i < rows; i++) {
      const factor = m[i][col];
      if (Math.abs(factor) < 1e-10) continue;
      for (let j = 0; j < cols; j++) m[i][j] -= factor * m[pivotRow][j];
      steps.push({
        operation: `R${i + 1} → R${i + 1} − ${formatNum(factor)}·R${pivotRow + 1}`,
        matrix: cloneMatrix(m),
      });
    }

    pivotRow++;
  }

  return steps;
}

export { formatNum };
