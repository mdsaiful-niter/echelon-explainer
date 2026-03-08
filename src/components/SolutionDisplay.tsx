import { motion } from "framer-motion";
import type { Step } from "@/lib/gaussian";
import TextMatrix from "./TextMatrix";

interface Props {
  initialMatrix: number[][];
  steps: Step[];
}

const SolutionDisplay = ({ initialMatrix, steps }: Props) => {
  const finalMatrix = steps.length > 0 ? steps[steps.length - 1].matrix : initialMatrix;

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Initial Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">
          Initial Augmented Matrix
        </h3>
        <div className="step-card p-4">
          <TextMatrix matrix={initialMatrix} />
        </div>
      </motion.div>

      {/* Steps */}
      {steps.map((step, idx) => {
        const isLastStep = idx === steps.length - 1;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">
                Step {idx + 1}
              </span>
            </div>

            {/* Operation */}
            <div className="step-card p-4 flex flex-col gap-3">
              <div className="step-operation text-sm">{step.operation}</div>

              {/* Label */}
              <div className="text-xs text-muted-foreground font-sans">
                {isLastStep ? "Final Row Echelon Matrix" : "Matrix"}
              </div>

              {/* Matrix after this step */}
              <TextMatrix
                matrix={step.matrix}
                highlightRows={step.changedRows}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Final result card */}
      {steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: steps.length * 0.06 }}
          className="result-card p-5 flex flex-col gap-3 glow-accent"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-accent font-sans">
            ✓ Row Echelon Form
          </h3>
          <TextMatrix matrix={finalMatrix} />
        </motion.div>
      )}

      {steps.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="step-card p-4 text-center text-muted-foreground text-sm font-sans"
        >
          Already in Row Echelon Form — no operations needed.
        </motion.div>
      )}
    </div>
  );
};

export default SolutionDisplay;
