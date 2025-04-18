"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import LoadingScreen from "@/components/ui/LoadingScreen";
import {
  verifyDocument,
  DocumentVerificationResponse,
} from "@/services/verification-api";
import SignatoryCard from "@/components/verification/SignatoryCard";
import VerificationDocumentUpload from "@/components/verification/VerificationDocumentUpload";

export default function VerificationForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<DocumentVerificationResponse | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Clear any previous results when a new file is selected
    if (verificationResult) {
      setVerificationResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setVerificationResult(null);

    try {
      if (!selectedFile) {
        throw new Error("Please select a document");
      }

      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Call the service function to upload the file
      const apiResponse = await verifyDocument(formData);

      if (!apiResponse) {
        throw new Error("No response received from the server");
      }

      if (apiResponse.message) {
        // There was an error or a specific message from the API
        setError(apiResponse.message);
      } else {
        // Success - store the verification result
        setVerificationResult(apiResponse);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setVerificationResult(null);
    setSelectedFile(null);
    setError(null);
  };

  // Calculate valid signatures count
  const validSignatures =
    verificationResult?.signatories.filter((s) => s.validSignature).length || 0;
  const totalSignatures = verificationResult?.signatories.length || 0;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 border border-gray-200">
      {/* Loading Screen */}
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
          Bhutan NDI Document Verification Portal
        </h1>
        <p className="text-gray-600 text-center mt-2 text-sm sm:text-base">
          Verify the authenticity of digitally signed documents
        </p>
      </div>

      {error && (
        <div className="p-3 sm:p-4 mb-6 rounded-md border bg-red-50 border-red-200 text-red-800 text-center font-medium text-sm sm:text-base">
          {error}
        </div>
      )}

      {/* Document Status Banner */}
      {verificationResult && (
        <div
          className={`p-3 sm:p-4 mb-6 rounded-md border ${
            verificationResult.validSignature
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          } text-center font-medium text-sm sm:text-base`}
        >
          {verificationResult.validSignature
            ? `✓ Document verified with ${validSignatures} valid signature${
                validSignatures !== 1 ? "s" : ""
              }`
            : `⚠️ Document verification incomplete (${validSignatures} of ${totalSignatures} valid signatures)`}
        </div>
      )}

      {verificationResult && verificationResult.signatories.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Signatories</h2>
          <div className="space-y-4">
            {verificationResult.signatories.map((signatory, index) => (
              <SignatoryCard
                key={`${signatory.email}-${index}`}
                signatory={signatory}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show the form if no verification has been done */}
      {!verificationResult && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <VerificationDocumentUpload
            file={selectedFile}
            onFileChange={handleFileSelect}
            error={error}
          />

          <Button type="submit" disabled={!selectedFile} className="mt-6">
            {!selectedFile ? "Upload a document to verify" : "Verify Document"}
          </Button>
        </form>
      )}

      {/* Show the "Verify Another Document" button after a verification attempt */}
      {verificationResult && (
        <div className="text-center mt-6">
          <Button type="button" onClick={resetForm}>
            Verify Another Document
          </Button>
        </div>
      )}
    </div>
  );
}
