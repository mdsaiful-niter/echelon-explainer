import type { Step } from "@/lib/gaussian";
import MatrixDisplay from "./MatrixDisplay";

interface Props {
  steps: Step[];
}

const StepDisplay = ({ steps }: Props) => (
  <div className="flex flex-col gap-4">
    {steps.map((step, idx) => (
      <div key={idx} className="step-card p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex flex-col items-center gap-1 min-w-[160px]">
          <span className="text-xs text-muted-foreground font-medium">Step {idx + 1}</span>
          <span className="step-operation text-sm">{step.operation}</span>
        </div>
        <MatrixDisplay matrix={step.matrix} />
      </div>
    ))}
  </div>
);

export default StepDisplay;
