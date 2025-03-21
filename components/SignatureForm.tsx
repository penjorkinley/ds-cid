"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadDocument, UploadResponse } from "@/services/ds-api";
import SuccessMessage from "./success/SuccessMessage";
import DocumentForm from "./DocumentForm";

interface FormData {
  name: string;
  email: string;
  cid: string;
  file: File | null;
  signatureCoordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export default function SignatureForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    cid: "",
    file: null,
    signatureCoordinates: null,
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
      signatureCoordinates: null, // Reset coordinates when file changes
    }));
  };

  const setSignatureCoordinates = (coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      signatureCoordinates: coordinates,
    }));
  };

  const sendEmailWithDocumentLink = async (response: UploadResponse) => {
    try {
      setEmailStatus("Sending email with document link...");

      // Use the documentViewUrl directly from the API response
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

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setIsSubmitting(true);
    setError(null);
    setEmailStatus(null);

    try {
      if (!formData.file) {
        throw new Error("Please select a file to upload");
      }

      if (!formData.signatureCoordinates) {
        throw new Error("Please set a signature placeholder in the document");
      }

      // Format the coordinates as a string to send to the API
      const signatureCoordinatesString = `x: ${formData.signatureCoordinates.x.toFixed(
        0
      )}, y: ${formData.signatureCoordinates.y.toFixed(
        0
      )}, width: ${formData.signatureCoordinates.width.toFixed(
        0
      )}, height: ${formData.signatureCoordinates.height.toFixed(0)}`;

      // Create a FormData object to send to the API
      const apiFormData = new FormData();
      apiFormData.append("name", formData.name);
      apiFormData.append("email", formData.email);
      apiFormData.append("cid", formData.cid);
      apiFormData.append("file", formData.file);
      apiFormData.append("signatureCoordinates", signatureCoordinatesString);

      const result = await uploadDocument({
        name: formData.name,
        email: formData.email,
        cid: formData.cid,
        file: formData.file,
        signatureCoordinates: signatureCoordinatesString,
      });

      console.log("Raw API Response:", result);
      setResponse(result);

      // Send email with document link
      await sendEmailWithDocumentLink(result);

      // Reset form
      setFormData({
        name: "",
        email: "",
        cid: "",
        file: null,
        signatureCoordinates: null,
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
          setSignatureCoordinates={setSignatureCoordinates}
        />
      )}
    </div>
  );
}
