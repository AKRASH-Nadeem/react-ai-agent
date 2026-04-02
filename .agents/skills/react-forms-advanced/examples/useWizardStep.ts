// hooks/useWizardStep.ts
// URL-backed wizard step manager for multi-step forms.
//
// Stores the current step in a URL search parameter so that:
//   - The browser back button navigates between steps
//   - Deep linking and page refresh land on the correct step
//   - No extra state lifting or context is needed
//
// Usage:
//   const { currentStep, nextStep, prevStep, isFirstStep, isLastStep } =
//     useWizardStep({ totalSteps: 3 });
//
//   URL will contain: ?step=1, ?step=2, ?step=3

import { useSearchParams } from "react-router-dom";

type UseWizardStepOptions = {
  totalSteps: number;
  /** URL search parameter name. Defaults to "step". */
  paramName?: string;
};

type UseWizardStepReturn = {
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
};

export function useWizardStep({
  totalSteps,
  paramName = "step",
}: UseWizardStepOptions): UseWizardStepReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Clamp to valid range — guards against manual URL tampering
  const currentStep = Math.min(
    Math.max(Number(searchParams.get(paramName) ?? "1"), 1),
    totalSteps
  );

  const goToStep = (step: number): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(paramName, String(step));
        return next;
      },
      { replace: false } // Add to history so the back button works
    );
  };

  const nextStep = (): void => {
    if (currentStep < totalSteps) goToStep(currentStep + 1);
  };

  const prevStep = (): void => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  return {
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}
