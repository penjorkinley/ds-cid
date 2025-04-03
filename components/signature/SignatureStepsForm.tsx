"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import StepIndicator, { Step } from "@/components/ui/StepIndicator";
import RecipientStep, { Recipient } from "@/components/signature/RecipientStep";
import DocumentUploadStep from "@/components/signature/DocumentUploadStep";
import PDFSignaturePlacement from "./PDFSignaturePlacement";

export interface SignaturePlaceholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface FormData {
  recipients: Recipient[];
  file: File | null;
  signaturePlaceholders: SignaturePlaceholder[];
}

interface MultiStepFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

// Error alert component for reusability
const ErrorAlert = ({ message }: { message: string }) => (
  <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
    {message}
  </div>
);

export default function SignatureStepsForm({ onSubmit }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    recipients: [],
    file: null,
    signaturePlaceholders: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const steps: Step[] = [
    { number: 1, title: "Add Recipient", subtitle: "Add document recipients" },
    { number: 2, title: "Add Document", subtitle: "Upload your document" },
    { number: 3, title: "Add Signature", subtitle: "Place signature fields" },
  ];

  // Handle recipient updates
  const handleRecipientsChange = (recipients: Recipient[]) => {
    setFormData((prev) => ({
      ...prev,
      recipients,
    }));
  };

  // Handle file upload
  const handleFileChange = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  // Handle signature placeholder updates
  const handleSignaturePlaceholdersChange = (
    placeholders: SignaturePlaceholder[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      signaturePlaceholders: placeholders,
    }));
  };

  // Check if we can proceed to a specific step
  const canProceedToStep = (step: number): boolean => {
    if (step <= currentStep) return true;

    if (step === 2) {
      return formData.recipients.length > 0;
    }

    if (step === 3) {
      return (
        formData.recipients.length > 0 &&
        formData.file !== null &&
        formData.file.type === "application/pdf"
      );
    }

    return false;
  };

  // Handle step navigation
  const handleStepClick = (step: number) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
      setError(null);
    }
  };

  // Navigate to next step
  const handleNext = () => {
    if (currentStep === 1 && formData.recipients.length === 0) {
      setError("Please add at least one recipient");
      return;
    }

    if (currentStep === 2 && !formData.file) {
      setError("Please upload a document");
      return;
    }

    if (currentStep === 2 && formData.file?.type !== "application/pdf") {
      setError("Only PDF files are supported for digital signatures");
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    setError(null);
  };

  // Navigate to previous step
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  // Handle final form submission
  const handleSubmit = async () => {
    if (formData.signaturePlaceholders.length === 0) {
      setError("Please add at least one signature placeholder");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the next button text based on current step and form state
  const getNextButtonText = (): string => {
    if (currentStep === 1 && formData.recipients.length === 0) {
      return "Add at least one recipient";
    }

    if (currentStep === 3 && formData.signaturePlaceholders.length === 0) {
      return "Add signature field";
    }

    return currentStep === steps.length ? "Submit" : "Next";
  };

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        canProceedToStep={canProceedToStep}
      />

      {/* Error message */}
      {error && <ErrorAlert message={error} />}

      {/* Step content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <RecipientStep
            recipients={formData.recipients}
            onRecipientsChange={handleRecipientsChange}
          />
        )}

        {currentStep === 2 && (
          <DocumentUploadStep
            file={formData.file}
            onFileChange={handleFileChange}
            error={error}
          />
        )}

        {currentStep === 3 && formData.file && (
          <PDFSignaturePlacement
            file={formData.file}
            onChange={handleSignaturePlaceholdersChange}
            placeholders={formData.signaturePlaceholders}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {currentStep > 1 && (
          <Button
            onClick={handleBack}
            fullWidth={false}
            className="order-2 sm:order-1 sm:w-1/2"
            type="button"
          >
            Back
          </Button>
        )}

        {currentStep < steps.length ? (
          <Button
            onClick={handleNext}
            className={`order-1 sm:order-2 ${
              currentStep > 1 ? "sm:w-1/2" : "w-full"
            }`}
            type="button"
            disabled={
              (currentStep === 1 && formData.recipients.length === 0) ||
              (currentStep === 2 && !formData.file)
            }
          >
            {getNextButtonText()}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="order-1 sm:order-2 sm:w-1/2"
            type="button"
            disabled={formData.signaturePlaceholders.length === 0}
          >
            {getNextButtonText()}
          </Button>
        )}
      </div>
    </div>
  );
}
