import { formatNum } from "@/lib/gaussian";

interface Props {
  matrix: number[][];
  label?: string;
}

const MatrixDisplay = ({ matrix, label }: Props) => (
  <div className="flex flex-col items-center gap-2">
    {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
    <div className="flex items-stretch">
      <div className="matrix-bracket-left" />
      <div className="flex flex-col gap-0.5 py-1 px-1">
        {matrix.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((val, j) => (
              <div key={j} className="matrix-cell-display rounded-sm">
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
