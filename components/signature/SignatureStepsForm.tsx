"use client";

import { useState } from "react";
import DocumentForm from "@/components/signature/DocumentDetailsStep";
import PDFSignaturePlacement from "./PDFSignaturePlacement";
import Button from "@/components/ui/Button";
import { z } from "zod";
import { validateForm } from "@/utils/validation-schemas";

interface FormData {
  name: string;
  email: string;
  cid: string;
  file: File | null;
  signaturePlaceholders: SignaturePlaceholder[];
}

export interface SignaturePlaceholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

interface MultiStepFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

// Enhanced responsive progress indicator component
const StepIndicator = ({
  currentStep,
  setError,
  setCurrentStep,
  formData,
  setValidationErrors,
}: {
  currentStep: number;
  setError: (error: string | null) => void;
  setCurrentStep: (step: number) => void;
  formData: FormData;
  setValidationErrors: (errors: z.ZodError | null) => void;
}) => {
  // Function to handle click on step indicator
  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setError(null);
      setValidationErrors(null);
    } else if (step === 2 && formData.file) {
      // Validate form before proceeding to step 2
      const { success, error } = validateForm(formData);

      if (!success) {
        setValidationErrors(error);
        return;
      }

      // Check if file is PDF
      if (formData.file.type !== "application/pdf") {
        setError("Only PDF files are supported for digital signatures");
        return;
      }

      setCurrentStep(2);
      setError(null);
      setValidationErrors(null);
    }
  };

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between w-full">
        {/* Step 1 */}
        <div
          className="flex flex-col items-center"
          onClick={() => handleStepClick(1)}
        >
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm sm:text-base transition-colors duration-300 
              ${
                currentStep >= 1
                  ? "bg-[#5AC893] shadow-md shadow-[#5AC893]/20"
                  : "bg-gray-300"
              } 
              ${currentStep !== 1 ? "cursor-pointer hover:bg-[#4bb382]" : ""}`}
          >
            1
          </div>
          <div className="mt-2 text-xs sm:text-sm font-medium text-center">
            <span
              className={currentStep === 1 ? "text-[#5AC893]" : "text-gray-700"}
            >
              Document<span className="hidden xs:inline"> Details</span>
            </span>
          </div>
        </div>

        {/* Progress line */}
        <div className="relative flex-1 mx-2 sm:mx-4">
          <div className="absolute inset-0 flex items-center">
            <div className="h-1 w-full bg-gray-200 rounded-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div
              className={`h-1 bg-[#5AC893] rounded-full transition-all duration-500 ease-in-out ${
                currentStep >= 2 ? "w-full" : "w-0"
              }`}
            ></div>
          </div>
        </div>

        {/* Step 2 */}
        <div
          className="flex flex-col items-center"
          onClick={() => handleStepClick(2)}
        >
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm sm:text-base relative transition-colors duration-300
              ${
                currentStep >= 2
                  ? "bg-[#5AC893] shadow-md shadow-[#5AC893]/20"
                  : "bg-gray-300"
              }
              ${
                currentStep === 1 && formData.file
                  ? "cursor-pointer hover:bg-gray-400"
                  : ""
              }`}
          >
            2
            {currentStep === 1 &&
              formData.file &&
              formData.file.type === "application/pdf" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
          </div>
          <div className="mt-2 text-xs sm:text-sm font-medium text-center">
            <span
              className={currentStep === 2 ? "text-[#5AC893]" : "text-gray-700"}
            >
              Signature<span className="hidden xs:inline"> Placement</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MultiStepForm({ onSubmit }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    cid: "",
    file: null,
    signaturePlaceholders: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<z.ZodError | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleFirstStepSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate the form using Zod
    const { success, error: zodError } = validateForm(formData);

    if (!success) {
      setValidationErrors(zodError);

      // Don't set a general error message for field-specific validations
      // Instead, let the field-specific error messages handle this

      return;
    }

    // If form is valid but not a PDF, show specific error
    if (formData.file && formData.file.type !== "application/pdf") {
      setError("Only PDF files are supported for digital signatures");
      return;
    }

    // Clear any previous errors and proceed to step 2
    setError(null);
    setValidationErrors(null);
    setCurrentStep(2);
  };

  const handleSignaturePlaceholdersChange = (
    placeholders: SignaturePlaceholder[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      signaturePlaceholders: placeholders,
    }));
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError(null);
    setValidationErrors(null);
  };

  const handleFinalSubmit = async () => {
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

  // Function to satisfy the interface
  const handleFormSubmit = () => {
    // Empty function
  };

  // Check if form is valid based on Zod validation
  const isFormValid = (): boolean => {
    const { success } = validateForm(formData);
    return success;
  };

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <StepIndicator
        currentStep={currentStep}
        setError={setError}
        setCurrentStep={setCurrentStep}
        formData={formData}
        setValidationErrors={setValidationErrors}
      />

      {/* Only show non-field validation errors in the top error box */}
      {error && !validationErrors && (
        <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <form onSubmit={handleFirstStepSubmit}>
          <DocumentForm
            formData={formData}
            error={null}
            fieldErrors={validationErrors}
            isSubmitting={isSubmitting}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            handleSubmit={handleFormSubmit}
          />
          <div className="mt-6">
            <Button
              type="submit"
              disabled={
                !formData.name ||
                !formData.email ||
                !formData.cid ||
                !formData.file
              }
            >
              {isFormValid() ? "Next" : "Please fill all required fields"}
            </Button>
          </div>
        </form>
      )}

      {currentStep === 2 && formData.file && (
        <div>
          <PDFSignaturePlacement
            file={formData.file}
            onChange={handleSignaturePlaceholdersChange}
            placeholders={formData.signaturePlaceholders}
          />
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              onClick={handleBack}
              fullWidth={true}
              className="order-2 sm:order-1"
              type="button"
            >
              Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              className="order-1 sm:order-2"
              type="button"
              disabled={formData.signaturePlaceholders.length === 0}
            >
              {formData.signaturePlaceholders.length === 0
                ? "Add signature field"
                : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
