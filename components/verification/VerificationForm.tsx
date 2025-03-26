"use client";

import { useState } from "react";
import Image from "next/image";
import FileUpload from "@/components/ui/FileUpload";
import Button from "@/components/ui/Button";
import {
  verifyDocument,
  VerificationApiResponse,
} from "@/services/verification-api";
import SignatoryCard from "@/components/verification/SignatoryCard";

export default function VerificationForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VerificationApiResponse[] | null>(
    null
  );
  const [documentStatus, setDocumentStatus] = useState<{
    isVerified: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResults(null);
    setDocumentStatus(null);

    try {
      if (!selectedFile) {
        throw new Error("Please select a document");
      }

      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Call the service function to upload the file
      const apiResponse = await verifyDocument(formData);

      // Check if the response is an array (multiple signatories)
      if (Array.isArray(apiResponse)) {
        // Set the results
        setResults(apiResponse);

        // Determine overall document status
        const hasSignedDocument = apiResponse.some(
          (response) => !!response.signature && !!response.signedAt
        );

        setDocumentStatus({
          isVerified: hasSignedDocument,
          message: hasSignedDocument
            ? "✓ Document has at least one valid signature"
            : "✗ Document has no valid signatures",
        });
      } else if (apiResponse && typeof apiResponse === "object") {
        // For single object response

        // Check for the document not found error
        if (apiResponse.message === "Document not found") {
          setDocumentStatus({
            isVerified: false,
            message: "Document not found in the system",
          });

          // Don't set results for not found documents
        } else {
          setResults([apiResponse]); // Convert to array for consistent handling

          setDocumentStatus({
            isVerified: !!apiResponse.signature && !!apiResponse.signedAt,
            message: apiResponse.message || "Document verification completed",
          });
        }
      } else {
        throw new Error("Unexpected response format from the server");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
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
          Document Verification Portal
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Verify the authenticity of digitally signed documents
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-md border bg-red-50 border-red-200 text-red-800 text-center font-medium">
          {error}
        </div>
      )}

      {documentStatus && (
        <div
          className={`p-4 mb-6 rounded-md border ${
            documentStatus.isVerified
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          } text-center font-medium`}
        >
          {documentStatus.message}
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Signatories</h2>
          <div className="space-y-4">
            {results.map((signatory, index) =>
              signatory.name && signatory.email ? (
                <SignatoryCard
                  key={`${signatory.email}-${index}`}
                  signatory={signatory}
                  index={index}
                />
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Show the form if no verification has been done or the document is not found */}
      {(!results || results.length === 0) && !documentStatus && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="documentFile"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Document
            </label>
            <FileUpload
              onFileSelect={(file) => setSelectedFile(file)}
              selectedFile={selectedFile}
            />
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Verify Document
          </Button>
        </form>
      )}

      {/* Always show the "Verify Another Document" button after a verification attempt */}
      {(results || documentStatus) && (
        <div className="text-center">
          <Button
            type="button"
            onClick={() => {
              setResults(null);
              setDocumentStatus(null);
              setSelectedFile(null);
              setError(null);
            }}
          >
            Verify Another Document
          </Button>
        </div>
      )}
    </div>
  );
}
