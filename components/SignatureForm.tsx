"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadDocument, UploadResponse } from "@/services/ds-api";
import SuccessMessage from "./success/SuccessMessage";
import DocumentForm from "./DocumentForm";

interface FormData {
  name: string;
  email: string;
  holderDid: string;
  file: File | null;
}

export default function SignatureForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    holderDid: "",
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

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

  const sendEmailWithQRCode = async (response: UploadResponse) => {
    try {
      setEmailStatus("Sending email with QR code...");

      const emailResponse = await fetch("/api/send-email", {
        // Note: corrected the API path
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

      // const emailData = await emailResponse.json();
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setEmailStatus(null);

    try {
      if (!formData.file) {
        throw new Error("Please select a file to upload");
      }

      const result = await uploadDocument({
        name: formData.name,
        email: formData.email,
        holderDid: formData.holderDid,
        file: formData.file,
      });
      console.log("Raw API Response:", result); // Check for trailing characters
      setResponse(result);

      // Send email with QR code
      await sendEmailWithQRCode(result);

      // Reset form
      setFormData({
        name: "",
        email: "",
        holderDid: "",
        file: null,
      });
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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 border border-gray-200">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 relative mb-4">
          <Image
            src="/ndi-logo.jpeg"
            alt="Bhutan NDI Digital Signature Logo"
            fill
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
        <DocumentForm
          formData={formData}
          error={error}
          isSubmitting={isSubmitting}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
