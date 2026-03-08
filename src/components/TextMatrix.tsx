import { formatNum } from "@/lib/gaussian";

interface Props {
  matrix: number[][];
  highlightRows?: number[];
}

const TextMatrix = ({ matrix, highlightRows }: Props) => {
  const cols = matrix[0]?.length ?? 0;
  const augCol = cols - 1;

  // Format all values first to compute column widths
  const formatted = matrix.map((row) =>
    row.map((val) => {
      const isZero = Math.abs(val) < 1e-10;
      return formatNum(isZero ? 0 : val);
    })
  );

  // Compute max width per column
  const colWidths: number[] = [];
  for (let j = 0; j < cols; j++) {
    let max = 1;
    for (let i = 0; i < matrix.length; i++) {
      max = Math.max(max, formatted[i][j].length);
    }
    colWidths.push(max);
  }

  return (
    <div className="font-mono text-sm leading-relaxed">
      {formatted.map((row, i) => {
        const isHighlighted = highlightRows?.includes(i);
        const cells: string[] = [];

        for (let j = 0; j < cols; j++) {
          const padded = formatted[i][j].padStart(colWidths[j], " ");
          if (j === augCol) {
            cells.push("| " + padded);
          } else {
            cells.push(padded);
          }
        }

        return (
          <div
            key={i}
            className={`whitespace-pre transition-colors ${
              isHighlighted
                ? "text-accent font-semibold"
                : "text-foreground"
            }`}
          >
            {cells.join("  ")}
          </div>
        );
      })}
    </div>
  );
};

export default TextMatrix;
