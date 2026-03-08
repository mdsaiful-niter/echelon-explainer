interface Props {
  size: number;
  values: number[][];
  onChange: (r: number, c: number, val: string) => void;
}

const MatrixInput = ({ size, values, onChange }: Props) => (
  <div className="flex items-stretch">
    <div className="matrix-bracket-left" />
    <div className="flex flex-col gap-1 py-1 px-1">
      {Array.from({ length: size }, (_, i) => (
        <div key={i} className="flex gap-1">
          {Array.from({ length: size }, (_, j) => (
            <input
              key={j}
              type="number"
              step="any"
              className="w-16 h-10 text-center rounded-sm border border-border bg-card font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={values[i]?.[j] ?? ""}
              onChange={(e) => onChange(i, j, e.target.value)}
              placeholder="0"
            />
          ))}
        </div>
      ))}
    </div>
    <div className="matrix-bracket-right" />
  </div>
);

export default MatrixInput;
