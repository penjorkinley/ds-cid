import React from "react";

export interface Step {
  number: number;
  title: string;
  subtitle?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  canProceedToStep?: (step: number) => boolean;
}

export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  canProceedToStep = (step) => step <= currentStep,
}: StepIndicatorProps) {
  const handleStepClick = (step: number) => {
    if (onStepClick && canProceedToStep(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div
              className="flex flex-col items-center"
              onClick={() => handleStepClick(step.number)}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white text-base 
                  transition-colors duration-300 
                  ${
                    currentStep >= step.number
                      ? "bg-[#5AC893] shadow-md shadow-[#5AC893]/20"
                      : "bg-gray-300"
                  } 
                  ${
                    currentStep !== step.number &&
                    canProceedToStep(step.number) &&
                    onStepClick
                      ? "cursor-pointer hover:bg-[#4bb382]"
                      : ""
                  }
                `}
              >
                {step.number}
              </div>
              <div className="mt-2 text-sm font-medium text-center">
                <span
                  className={
                    currentStep === step.number
                      ? "text-[#5AC893]"
                      : "text-gray-700"
                  }
                >
                  {step.title}
                </span>
              </div>
              {step.subtitle && (
                <div className="text-xs text-gray-500 text-center hidden sm:block">
                  {step.subtitle}
                </div>
              )}
            </div>

            {/* Progress line between steps (except after the last step) */}
            {index < steps.length - 1 && (
              <div className="relative flex-1 mx-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-1 w-full bg-gray-200 rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div
                    className={`
                      h-1 bg-[#5AC893] rounded-full transition-all duration-500 ease-in-out 
                      ${currentStep > step.number ? "w-full" : "w-0"}
                    `}
                  ></div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
