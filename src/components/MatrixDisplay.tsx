import { formatNum } from "@/lib/gaussian";

interface Props {
  matrix: number[][];
  label?: string;
}

const MatrixDisplay = ({ matrix, label }: Props) => (
  <div className="flex flex-col items-center gap-2">
    {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
    <div className="flex items-stretch">
      <div className="matrix-bracket-left" />
      <div className="flex flex-col gap-1 py-1.5 px-1">
        {matrix.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((val, j) => (
              <div
                key={j}
                className={`matrix-cell-display ${
                  val === 1 && j <= i ? "text-accent font-semibold" : 
                  val === 0 && j < i ? "text-muted-foreground/40" : "text-foreground"
                }`}
              >
                {formatNum(val)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="matrix-bracket-right" />
    </div>
  </div>
);

export default MatrixDisplay;
