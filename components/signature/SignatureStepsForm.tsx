"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from "react";
import Button from "@/components/ui/Button";
import StepIndicator, { Step } from "@/components/ui/StepIndicator";
import RecipientStep, { Recipient } from "@/components/signature/RecipientStep";
import DocumentUploadStep from "@/components/signature/DocumentUploadStep";
import PDFSignaturePlacement, {
  SignaturePlaceholder,
} from "@/components/signature/PDFSignaturePlacement";

export interface FormData {
  recipients: Recipient[];
  file: File | null;
  signaturePlaceholders: SignaturePlaceholder[];
}

interface MultiStepFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  onFormUpdate?: (formData: FormData) => void; // Callback for form updates
}

// Create the ref interface with methods
export interface MultiStepForm {
  addContactToForm: (
    contact: Omit<Recipient, "id"> & { savedContactId?: string }
  ) => boolean;
  getCurrentStep: () => number; // Method to get current step
}

const SignatureStepsForm = forwardRef<MultiStepForm, MultiStepFormProps>(
  ({ onSubmit, onFormUpdate }, ref) => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<FormData>({
      recipients: [],
      file: null,
      signaturePlaceholders: [],
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Notify parent of form data changes
    useEffect(() => {
      if (onFormUpdate) {
        onFormUpdate(formData);
      }
    }, [formData, onFormUpdate]);

    // Function to add a contact as a recipient
    const addContactToForm = useCallback(
      (contact: Omit<Recipient, "id"> & { savedContactId?: string }) => {
        // Check for duplicate before adding
        const isDuplicate = formData.recipients.some(
          (r) =>
            r.email.toLowerCase() === contact.email.toLowerCase() ||
            r.idValue === contact.idValue ||
            r.savedContactId === contact.savedContactId
        );

        if (!isDuplicate) {
          const newRecipient: Recipient = {
            ...contact,
            id: `recipient-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
            savedContactId: contact.savedContactId, // Preserve the link to saved contact
          };

          setFormData((prev) => ({
            ...prev,
            recipients: [...prev.recipients, newRecipient],
          }));

          // If we're not already on step 1, go to step 1 to show the new recipient
          if (currentStep !== 1) {
            setCurrentStep(1);
          }

          return true; // Indicate success
        } else {
          // Show specific error message for duplicates
          setError(
            `Contact "${contact.name}" is already added to the recipients list.`
          );
          setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
          return false; // Indicate failure
        }
      },
      [formData.recipients, currentStep]
    );

    // Expose methods to parent component via ref
    useImperativeHandle(
      ref,
      () => ({
        addContactToForm,
        getCurrentStep: () => currentStep, // Expose the current step
      }),
      [addContactToForm, currentStep]
    );

    const steps: Step[] = [
      {
        number: 1,
        title: "Add Recipients",
        subtitle: "Add document recipients",
      },
      { number: 2, title: "Upload Document", subtitle: "Upload your document" },
      {
        number: 3,
        title: "Add Signatures",
        subtitle: "Place signature fields",
      },
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

      // Verify that each recipient has a signature placeholder
      const recipientIds = formData.recipients.map((r) => r.id);
      const placeholderRecipientIds = formData.signaturePlaceholders.map(
        (p) => p.recipientId
      );
      const allRecipientsHavePlaceholder = recipientIds.every((id) =>
        placeholderRecipientIds.includes(id)
      );

      if (!allRecipientsHavePlaceholder) {
        setError("Please add signature placeholders for all recipients");
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
        setIsSubmitting(false);
      }
    };

    // Get the next button text based on current step and form state
    const getNextButtonText = (): string => {
      if (currentStep === 1 && formData.recipients.length === 0) {
        return "Add at least one recipient";
      }

      if (currentStep === 3) {
        const notAssignedCount =
          formData.recipients.length -
          formData.signaturePlaceholders.filter((p) =>
            formData.recipients.some((r) => r.id === p.recipientId)
          ).length;

        if (notAssignedCount > 0) {
          return `Add ${notAssignedCount} more signature${
            notAssignedCount > 1 ? "s" : ""
          }`;
        }
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
        {error && (
          <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

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
              recipients={formData.recipients}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {currentStep > 1 && (
            <Button
              onClick={handleBack}
              fullWidth={true}
              className="order-2 sm:order-1 sm:flex-1"
              type="button"
            >
              Back
            </Button>
          )}

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              className={`order-1 sm:order-2 sm:flex-1`}
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
              className="order-1 sm:order-2 sm:flex-1"
              type="button"
              disabled={
                formData.signaturePlaceholders.length === 0 ||
                formData.signaturePlaceholders.length <
                  formData.recipients.length
              }
            >
              {getNextButtonText()}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

SignatureStepsForm.displayName = "SignatureStepsForm";

export default SignatureStepsForm;
