"use client";

import { useState } from "react";
import DocumentForm from "@/components/signature/DocumentDetailsStep";
import PDFSignaturePlacement from "./PDFSignaturePlacement";
import Button from "@/components/ui/Button";

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
    if (!formData.file) {
      setError("Please select a file to upload");
      return;
    }

    // Only allow PDF files for the signature placement step
    if (formData.file.type !== "application/pdf") {
      setError("Only PDF files are supported for digital signatures");
      return;
    }

    setError(null);
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

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                currentStep >= 1 ? "bg-[#5AC893]" : "bg-gray-300"
              }`}
            >
              1
            </div>
            <div className="ml-2">Document Details</div>
          </div>
          <div
            className={`flex-1 h-1 mx-4 ${
              currentStep >= 2 ? "bg-[#5AC893]" : "bg-gray-200"
            }`}
          ></div>
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                currentStep >= 2 ? "bg-[#5AC893]" : "bg-gray-300"
              }`}
            >
              2
            </div>
            <div className="ml-2">Signature Placement</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <form onSubmit={handleFirstStepSubmit}>
          <DocumentForm
            formData={formData}
            error={null}
            isSubmitting={false}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            handleSubmit={(e) => {}}
          />
          <div className="mt-6">
            <Button type="submit">Next</Button>
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
          <div className="flex gap-4 mt-6">
            <Button onClick={handleBack} fullWidth={false} type="button">
              Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              type="button"
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
