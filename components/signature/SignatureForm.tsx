"use client";

import { useState } from "react";
import Image from "next/image";
import {
  uploadDocument,
  UploadResponse,
  SignaturePlaceholder,
} from "@/services/ds-api";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SuccessMessage from "@/components/success/SuccessMessage";
import MultiStepForm from "@/components/signature/SignatureStepsForm";
import { Recipient } from "@/components/signature/RecipientStep";

// Interface for our updated multi-recipient form data
interface MultiRecipientFormData {
  recipients: Recipient[];
  file: File | null;
  signaturePlaceholders: SignaturePlaceholder[];
}

export default function SignatureForm() {
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

      if (!formData.file) {
        throw new Error("Please select a file to upload");
      }

      if (formData.recipients.length === 0) {
        throw new Error("Please add at least one recipient");
      }

      // Convert recipients to API format
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

      console.log("Raw API Response:", result);
      setResponse(result);

      // Send email with QR code to all recipients
      await sendEmailWithQRCode(result);
    } catch (err) {
      console.error("Error submitting form:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 border border-gray-200">
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

      {response ? (
        <div className="py-4 sm:py-6 md:py-8 bg-white">
          <SuccessMessage
            response={response}
            emailStatus={emailStatus}
            onReset={() => {
              setResponse(null);
              setEmailStatus(null);
            }}
          />
        </div>
      ) : (
        <MultiStepForm onSubmit={handleSubmit} />
      )}
    </div>
  );
}
