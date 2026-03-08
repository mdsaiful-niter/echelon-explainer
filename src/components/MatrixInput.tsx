import { useRef, useCallback } from "react";

interface Props {
  rows: number;
  cols: number;
  values: number[][];
  onChange: (r: number, c: number, val: string) => void;
}

const MatrixInput = ({ rows, cols, values, onChange }: Props) => {
  const augCol = cols - 1;
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const setRef = useCallback((el: HTMLInputElement | null, r: number, c: number) => {
    if (!inputRefs.current[r]) inputRefs.current[r] = [];
    inputRefs.current[r][c] = el;
  }, []);

  const focusCell = (r: number, c: number) => {
    inputRefs.current[r]?.[c]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "Tab":
        if (c < cols - 1) { e.preventDefault(); focusCell(r, c + 1); }
        else if (r < rows - 1) { e.preventDefault(); focusCell(r + 1, 0); }
        break;
      case "ArrowLeft":
        if (c > 0) { e.preventDefault(); focusCell(r, c - 1); }
        else if (r > 0) { e.preventDefault(); focusCell(r - 1, cols - 1); }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (r < rows - 1) focusCell(r + 1, c);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (r > 0) focusCell(r - 1, c);
        break;
      case "Enter":
        e.preventDefault();
        if (r < rows - 1) focusCell(r + 1, c);
        else if (c < cols - 1) focusCell(0, c + 1);
        break;
    }
  };

  return (
    <div className="flex items-stretch">
      <div className="matrix-bracket-left" />
      <div className="flex flex-col gap-1.5 py-1.5 px-1.5">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            {Array.from({ length: cols }, (_, j) => (
              <div key={j} className="flex items-center gap-1.5">
                {j === augCol && (
                  <div className="w-px h-10 bg-primary/40 mx-1" />
                )}
                <input
                  ref={(el) => setRef(el, i, j)}
                  type="number"
                  step="any"
                  className="w-16 h-10 text-center rounded-md border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
                  value={values[i]?.[j] === 0 ? "" : values[i]?.[j] ?? ""}
                  onChange={(e) => onChange(i, j, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i, j)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="matrix-bracket-right" />
    </div>
  );
};

export default MatrixInput;
