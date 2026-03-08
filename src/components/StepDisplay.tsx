import { motion } from "framer-motion";
import type { Step } from "@/lib/gaussian";
import MatrixDisplay from "./MatrixDisplay";
import { Info } from "lucide-react";

interface Props {
  steps: Step[];
}

const StepDisplay = ({ steps }: Props) => (
  <div className="flex flex-col gap-3">
    {steps.map((step, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.08 }}
        className="step-card p-4 flex flex-col gap-3"
      >
        {/* Step header */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest shrink-0">
            Step {idx + 1}
          </span>
          <span className="step-operation text-sm leading-tight">
            {step.operation}
          </span>
        </div>

        {/* Explanation */}
        <div className="flex items-start gap-2 bg-primary/5 rounded-lg px-3 py-2">
          <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.explanation}
          </p>
        </div>

        {/* Matrix */}
        <div className="flex justify-center">
          <MatrixDisplay
            matrix={step.matrix}
            pivotCell={step.pivotCell}
            highlightRows={step.changedRows}
          />
        </div>
      </motion.div>
    ))}
  </div>
);

export default StepDisplay;
