import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import MatrixInput from "@/components/MatrixInput";
import MatrixDisplay from "@/components/MatrixDisplay";
import StepDisplay from "@/components/StepDisplay";
import { gaussianElimination, gaussJordanElimination, type Step } from "@/lib/gaussian";
import { Grid3X3, Sparkles, ArrowDown, RotateCcw } from "lucide-react";

const EXAMPLES: { label: string; matrix: number[][] }[] = [
  {
    label: "3×4",
    matrix: [
      [2, 1, -1, 8],
      [-3, -1, 2, -11],
      [-2, 1, 2, -3],
    ],
  },
  {
    label: "2×3",
    matrix: [
      [1, -2, 1],
      [3, 1, 11],
    ],
  },
  {
    label: "4×5",
    matrix: [
      [1, 2, -1, 3, 5],
      [2, 5, 0, 1, 4],
      [3, 7, -1, 4, 9],
      [1, 3, 1, -2, -1],
    ],
  },
];

const Index = () => {
  const [size, setSize] = useState(3);
  const [values, setValues] = useState<number[][]>(
    Array.from({ length: 3 }, () => Array(4).fill(0))
  );
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [rrefSteps, setRrefSteps] = useState<Step[] | null>(null);
  const [mode, setMode] = useState<"ref" | "rref">("ref");
  const [showInput, setShowInput] = useState(false);

  const handleSizeChange = (n: number) => {
    const clamped = Math.max(2, Math.min(6, n));
    setSize(clamped);
    setValues(Array.from({ length: clamped }, () => Array(clamped + 1).fill(0)));
    setSteps(null);
    setRrefSteps(null);
    setShowInput(true);
  };

  const handleCellChange = useCallback((r: number, c: number, val: string) => {
    setValues((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val === "" ? 0 : parseFloat(val) || 0;
      return next;
    });
  }, []);

  const loadExample = (matrix: number[][]) => {
    setSize(matrix.length);
    setValues(matrix.map((r) => [...r]));
    setSteps(null);
    setShowInput(true);
  };

  const reduce = () => {
    const result = gaussianElimination(values);
    setSteps(result);
  };

  const reset = () => {
    setValues(Array.from({ length: size }, () => Array(size + 1).fill(0)));
    setSteps(null);
  };

  const finalMatrix =
    steps && steps.length > 0 ? steps[steps.length - 1].matrix : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 glass">
        <div className="container mx-auto px-4 py-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
            <Grid3X3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight gradient-text">
              Gaussian Elimination
            </h1>
            <p className="text-xs text-muted-foreground tracking-wide uppercase mt-0.5">
              Augmented Matrix → Row Echelon Form
            </p>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-8 max-w-3xl flex flex-col gap-6">
        {/* Size & Examples */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 flex flex-col gap-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Equations (n)
              </label>
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleSizeChange(n)}
                    className={`w-10 h-10 rounded-lg font-mono text-sm font-bold transition-all ${
                      size === n && showInput
                        ? "bg-primary text-primary-foreground glow-primary"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                Creates {size} × {size + 1} augmented matrix
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:ml-auto">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Load Example
              </label>
              <div className="flex gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => loadExample(ex.matrix)}
                    className="px-3 h-10 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all border border-border/50"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Matrix Input */}
        <AnimatePresence>
          {showInput && (
            <motion.section
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="glass rounded-xl p-6 flex flex-col items-center gap-6"
            >
              <div className="flex items-center justify-between w-full">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Augmented Matrix [{size} × {size + 1}]
                </label>
                <button
                  onClick={reset}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </button>
              </div>
              <div className="overflow-x-auto w-full flex justify-center">
                <MatrixInput
                  rows={size}
                  cols={size + 1}
                  values={values}
                  onChange={handleCellChange}
                />
              </div>
              <Button
                onClick={reduce}
                size="lg"
                className="w-full sm:w-auto gap-2 font-bold glow-primary"
              >
                <Sparkles className="h-4 w-4" />
                Reduce Matrix
              </Button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Steps */}
        <AnimatePresence>
          {steps && steps.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Elimination Steps
                </h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                  {steps.length} ops
                </span>
              </div>
              <StepDisplay steps={steps} />
            </motion.section>
          )}
        </AnimatePresence>

        {steps && steps.length === 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-6 text-center text-muted-foreground text-sm"
          >
            Already in Row Echelon Form — no operations needed.
          </motion.section>
        )}

        {/* Final Result */}
        <AnimatePresence>
          {finalMatrix && (
            <motion.section
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="result-card p-6 flex flex-col items-center gap-4 glow-accent"
            >
              <h2 className="text-sm font-bold uppercase tracking-wider text-accent">
                ✓ Row Echelon Form
              </h2>
              <MatrixDisplay matrix={finalMatrix} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
