"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  uploadDocument,
  UploadResponse,
  SignaturePlaceholder,
} from "@/services/ds-api";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SuccessMessage from "@/components/success/SuccessMessage";
import MultiStepForm, {
  MultiStepForm as MultiStepFormInterface,
} from "@/components/signature/SignatureStepsForm";
import { Recipient } from "@/components/signature/RecipientStep";
import { SavedRecipient } from "@/components/saved-recipients/SavedRecipientsContext";
import AlertModal from "@/components/ui/AlertModal"; // Import AlertModal

// Interface for our updated multi-recipient form data
interface MultiRecipientFormData {
  recipients: Recipient[];
  file: File | null;
  signaturePlaceholders: SignaturePlaceholder[];
}

interface SignatureFormProps {
  selectedContact?: SavedRecipient | null;
  onContactUsed?: () => void;
  onRecipientsChange?: (recipients: Recipient[]) => void;
}

export default function SignatureForm({
  selectedContact,
  onContactUsed,
  onRecipientsChange,
}: SignatureFormProps) {
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentFormData, setCurrentFormData] =
    useState<MultiRecipientFormData | null>(null);

  // Add state for AlertModal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  // Use useRef to hold a reference to the MultiStepForm component
  const formInstanceRef = useRef<MultiStepFormInterface | null>(null);

  // Handle when a contact is selected from the contacts panel
  useEffect(() => {
    if (selectedContact && formInstanceRef.current) {
      // Get the current step from the form instance
      const currentStep = formInstanceRef.current.getCurrentStep?.() || 1;

      // Only add the contact if we're on step 1
      if (currentStep === 1) {
        const success = formInstanceRef.current.addContactToForm({
          name: selectedContact.name,
          email: selectedContact.email,
          idType: selectedContact.idType,
          idValue: selectedContact.idValue,
          savedContactId: selectedContact.id, // Track the source saved contact ID
        });

        // Notify parent that the contact has been used (regardless of success)
        if (onContactUsed) {
          onContactUsed();
        }
      } else {
        // Replace alert with modal
        setAlertTitle("Wrong Step");
        setAlertMessage(
          "Recipients can only be added in the first step. Please go back to step 1 to add recipients."
        );
        setShowAlertModal(true);

        if (onContactUsed) {
          onContactUsed(); // Clear the selected contact
        }
      }
    }
  }, [selectedContact, onContactUsed]);

  // Send email with QR code to the first recipient
  const sendEmailWithQRCode = async (response: UploadResponse) => {
    try {
      // Find the first recipient by order
      const orderedRecipients = [...response.recipients].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      const firstRecipient = orderedRecipients[0];

      if (!firstRecipient) {
        throw new Error("No recipients found in the response");
      }

      setEmailStatus(
        `Sending email to first signatory (${firstRecipient.name})...`
      );

      // Create a recipient-specific response object
      const recipientResponse = {
        ...response,
        currentRecipient: firstRecipient, // Add the current recipient to the response
      };

      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: recipientResponse }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(
          errorData.message || `Server error: ${emailResponse.status}`
        );
      }

      setEmailStatus(
        `Email sent successfully to ${firstRecipient.name} (${firstRecipient.email})`
      );
    } catch (err) {
      console.error("Error sending email:", err);
      setEmailStatus(
        err instanceof Error
          ? `Failed to send email: ${err.message}`
          : "Failed to send email"
      );
    }
  };

  const handleSubmit = async (formData: MultiRecipientFormData) => {
    try {
      setIsSubmitting(true);
      setFormError(null);

      if (!formData.file) {
        throw new Error("Please select a file to upload");
      }

      if (formData.recipients.length === 0) {
        throw new Error("Please add at least one recipient");
      }

      // Save current form data for parent components
      setCurrentFormData(formData);

      // Notify parent of recipients change
      if (onRecipientsChange) {
        onRecipientsChange(formData.recipients);
      }

      // Convert recipients to API format - strip out our internal properties like savedContactId
      const apiRecipients = formData.recipients.map((recipient, index) => ({
        id: recipient.id,
        name: recipient.name,
        email: recipient.email,
        cid: recipient.idValue,
        order: index + 1,
      }));

      // Send data to the API using the new structure
      const result = await uploadDocument({
        recipients: apiRecipients,
        file: formData.file,
        signaturePlaceholders: formData.signaturePlaceholders.map(
          (placeholder) => ({
            ...placeholder,
            recipientId: placeholder.recipientId || formData.recipients[0].id, // Add a default if missing
          })
        ),
      });

      setResponse(result);

      // Send email with QR code to the first recipient
      await sendEmailWithQRCode(result);
    } catch (err) {
      console.error("Error submitting form:", err);
      setFormError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form to initial state
  const resetForm = () => {
    setResponse(null);
    setEmailStatus(null);
    setFormError(null);
    setCurrentFormData(null);

    // Notify parent of empty recipients
    if (onRecipientsChange) {
      onRecipientsChange([]);
    }
  };

  // Handle ref with a stable callback
  const setFormRef = (instance: MultiStepFormInterface | null) => {
    formInstanceRef.current = instance;
  };

  // Handle recipients change from the form
  const handleFormUpdate = (formData: MultiRecipientFormData) => {
    setCurrentFormData(formData);

    // Notify parent of recipients change
    if (onRecipientsChange) {
      onRecipientsChange(formData.recipients);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      {/* Loading Screen - Shows during form submission */}
      {isSubmitting && <LoadingScreen />}

      <div className="flex flex-col items-center mb-6 sm:mb-8">
        {/* Responsive logo: smaller on mobile devices */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 relative mb-3 sm:mb-4">
          <Image
            src="/ndi-logo.jpeg"
            alt="Bhutan NDI Digital Signature Logo"
            fill
            sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
            className="object-contain"
            priority
          />
        </div>
        {/* Responsive heading: smaller font on mobile devices */}
        <h1 className="text-lg sm:text-2xl font-bold text-center text-[#141B29] px-2">
          Bhutan NDI Digital Signature Portal
        </h1>
      </div>

      {/* Form error message */}
      {formError && (
        <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {formError}
        </div>
      )}

      {response ? (
        <div className="py-4 sm:py-6 md:py-8">
          <SuccessMessage
            response={response}
            emailStatus={emailStatus}
            onReset={resetForm}
          />
        </div>
      ) : (
        <MultiStepForm
          onSubmit={handleSubmit}
          ref={setFormRef}
          onFormUpdate={handleFormUpdate}
        />
      )}

      {/* Add Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertTitle}
        message={alertMessage}
        variant="warning"
      />
    </div>
  );
}
