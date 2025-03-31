"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadDocument, UploadResponse } from "@/services/ds-api";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SuccessMessage from "@/components/success/SuccessMessage";
import MultiStepForm, {
  SignaturePlaceholder,
} from "@/components/signature/SignatureStepsForm";

interface FormData {
  name: string;
  email: string;
  cid: string;
  file: File | null;
  signaturePlaceholders: SignaturePlaceholder[];
}

export default function SignatureForm() {
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const sendEmailWithQRCode = async (response: UploadResponse) => {
    try {
      setEmailStatus("Sending email with QR code...");

      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(
          errorData.message || `Server error: ${emailResponse.status}`
        );
      }

      setEmailStatus("Email sent successfully to " + response.email);
    } catch (err) {
      console.error("Error sending email:", err);
      setEmailStatus(
        err instanceof Error
          ? `Failed to send email: ${err.message}`
          : "Failed to send email"
      );
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      if (!formData.file) {
        throw new Error("Please select a file to upload");
      }

      // Add signature placeholders to form data before sending to API
      const formDataWithSignatures = new FormData();
      formDataWithSignatures.append("name", formData.name);
      formDataWithSignatures.append("email", formData.email);
      formDataWithSignatures.append("cid", formData.cid);
      formDataWithSignatures.append("file", formData.file);

      // Convert placeholders to JSON and add them to the form data
      formDataWithSignatures.append(
        "signaturePlaceholders",
        JSON.stringify(formData.signaturePlaceholders)
      );

      // Update the uploadDocument function to handle the signature placeholders
      const result = await uploadDocument({
        name: formData.name,
        email: formData.email,
        cid: formData.cid,
        file: formData.file,
        signaturePlaceholders: formData.signaturePlaceholders,
      });

      console.log("Raw API Response:", result);
      setResponse(result);

      // Send email with QR code
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
