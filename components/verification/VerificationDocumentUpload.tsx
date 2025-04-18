"use client";

import React, { useState } from "react";
import FileUpload from "@/components/ui/FileUpload";

interface VerificationDocumentUploadProps {
  file: File | null;
  onFileChange: (file: File) => void;
  error?: string | null;
}

// Success message component for reusability
const SuccessMessage = () => (
  <div className="p-3 bg-green-50 rounded-md border border-green-100">
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-green-500 mr-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm text-green-700">
        Document ready for verification
      </span>
    </div>
  </div>
);

// Info message component for verification context
const VerificationInfoMessage = () => (
  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3 flex-1 md:flex md:justify-between">
        <p className="text-sm text-blue-700">
          Upload a document to verify its digital signatures. The system will
          check the authenticity and show you who has signed it.
        </p>
      </div>
    </div>
  </div>
);

export default function VerificationDocumentUpload({
  file,
  onFileChange,
  error,
}: VerificationDocumentUploadProps) {
  // Track file-specific error separate from global form error
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileSelect = (newFile: File) => {
    // Clear any file-specific errors when a new file is selected
    setFileError(null);

    // Check if file is PDF
    if (newFile && !newFile.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Only PDF files are supported");
      return;
    }

    onFileChange(newFile);
  };

  return (
    <div className="space-y-6">
      <VerificationInfoMessage />
      <div>
        <div className="bg-white">
          <div className="text-center space-y-4">
            {/* Use the improved FileUpload component */}
            <div className="mt-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={file}
                acceptedFileTypes=".pdf"
              />
            </div>

            {/* Show file-specific error */}
            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}

            {/* Show success message only when we have a file and no errors */}
            {file && !fileError && !error && <SuccessMessage />}
          </div>
        </div>
      </div>
    </div>
  );
}
