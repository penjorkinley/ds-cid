"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadDocument, UploadResponse } from "@/services/ds-api";
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
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 border border-gray-200">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 relative mb-4">
          <Image
            src="/ndi-logo.jpeg"
            alt="Bhutan NDI Digital Signature Logo"
            fill
            sizes="(max-width: 768px) 100vw, 64px"
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-center text-[#141B29]">
          Bhutan NDI Digital Signature Portal
        </h1>
      </div>

      {response ? (
        <SuccessMessage
          response={response}
          emailStatus={emailStatus}
          onReset={() => {
            setResponse(null);
            setEmailStatus(null);
          }}
        />
      ) : (
        <MultiStepForm onSubmit={handleSubmit} />
      )}
    </div>
  );
}
