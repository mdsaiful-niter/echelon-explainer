import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import MatrixInput from "@/components/MatrixInput";
import MatrixDisplay from "@/components/MatrixDisplay";
import StepDisplay from "@/components/StepDisplay";
import { gaussianElimination, type Step } from "@/lib/gaussian";
import { Grid3X3 } from "lucide-react";

const Index = () => {
  const [size, setSize] = useState(3);
  const [values, setValues] = useState<number[][]>(
    Array.from({ length: 3 }, () => Array(3).fill(0))
  );
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [showInput, setShowInput] = useState(false);

  const handleSizeChange = (n: number) => {
    const clamped = Math.max(2, Math.min(6, n));
    setSize(clamped);
    setValues(Array.from({ length: clamped }, () => Array(clamped).fill(0)));
    setSteps(null);
    setShowInput(true);
  };

  const handleCellChange = useCallback((r: number, c: number, val: string) => {
    setValues((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val === "" ? 0 : parseFloat(val) || 0;
      return next;
    });
  }, []);

  const reduce = () => {
    const result = gaussianElimination(values);
    setSteps(result);
  };

  const finalMatrix = steps && steps.length > 0 ? steps[steps.length - 1].matrix : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Grid3X3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">Gaussian Elimination</h1>
            <p className="text-sm text-muted-foreground">Step-by-step Row Echelon Form reduction</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl flex flex-col gap-8">
        {/* Dimension input */}
        <section className="bg-card rounded-xl border border-border p-6 flex flex-col gap-4">
          <label className="text-sm font-semibold text-foreground">Matrix Dimension</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={2}
              max={6}
              value={size}
              onChange={(e) => handleSizeChange(parseInt(e.target.value) || 2)}
              className="w-20 h-10 text-center rounded-lg border border-border bg-background font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-mono">× {size}</span>
            <Button onClick={() => handleSizeChange(size)} variant="default" className="ml-auto">
              Generate Grid
            </Button>
          </div>
        </section>

        {/* Matrix input */}
        {showInput && (
          <section className="bg-card rounded-xl border border-border p-6 flex flex-col items-center gap-6">
            <label className="text-sm font-semibold text-foreground self-start">Enter Matrix Values</label>
            <MatrixInput size={size} values={values} onChange={handleCellChange} />
            <Button onClick={reduce} size="lg" className="w-full sm:w-auto">
              Reduce Matrix
            </Button>
          </section>
        )}

        {/* Steps */}
        {steps && steps.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold font-display">Elimination Steps</h2>
            <StepDisplay steps={steps} />
          </section>
        )}

        {steps && steps.length === 0 && (
          <section className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
            The matrix is already in Row Echelon Form — no operations needed.
          </section>
        )}

        {/* Final result */}
        {finalMatrix && (
          <section className="result-card p-6 flex flex-col items-center gap-4">
            <h2 className="text-lg font-bold font-display text-accent">Row Echelon Form</h2>
            <MatrixDisplay matrix={finalMatrix} />
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
