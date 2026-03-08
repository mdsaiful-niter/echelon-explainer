import { formatNum } from "@/lib/gaussian";

interface Props {
  matrix: number[][];
  label?: string;
  pivotCell?: [number, number];
}

const MatrixDisplay = ({ matrix, label, pivotCell }: Props) => {
  const cols = matrix[0]?.length ?? 0;
  const augCol = cols - 1;

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <div className="flex items-stretch">
        <div className="matrix-bracket-left" />
        <div className="flex flex-col gap-1 py-1.5 px-1">
          {matrix.map((row, i) => (
            <div key={i} className="flex gap-1 items-center">
              {row.map((val, j) => {
                const isPivot = pivotCell && pivotCell[0] === i && pivotCell[1] === j;
                const isZero = Math.abs(val) < 1e-10;
                const isLeadingOne = val === 1 && j <= i;

                return (
                  <div key={j} className="flex items-center gap-1">
                    {j === augCol && (
                      <div className="w-px h-7 bg-primary/30 mx-0.5" />
                    )}
                    <div
                      className={`matrix-cell-display ${
                        isPivot
                          ? "ring-2 ring-accent text-accent font-bold"
                          : isLeadingOne
                          ? "text-accent font-semibold"
                          : isZero && j < augCol
                          ? "text-muted-foreground/40"
                          : "text-foreground"
                      }`}
                    >
                      {formatNum(isZero ? 0 : val)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="matrix-bracket-right" />
      </div>
    </div>
  );
};

export default MatrixDisplay;
