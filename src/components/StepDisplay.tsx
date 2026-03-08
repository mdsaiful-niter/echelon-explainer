import { motion } from "framer-motion";
import type { Step } from "@/lib/gaussian";
import MatrixDisplay from "./MatrixDisplay";

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
        className="step-card p-4 flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="flex flex-col items-center gap-1.5 min-w-[140px] shrink-0">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
            Step {idx + 1}
          </span>
          <span className="step-operation text-sm leading-tight text-center">
            {step.operation}
          </span>
        </div>
        <div className="w-px h-10 bg-border hidden sm:block" />
        <MatrixDisplay matrix={step.matrix} />
      </motion.div>
    ))}
  </div>
);

export default StepDisplay;
