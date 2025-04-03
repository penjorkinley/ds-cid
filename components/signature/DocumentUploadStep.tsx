"use client";

import React from "react";
import FileUpload from "@/components/ui/FileUpload";

interface DocumentUploadStepProps {
  file: File | null;
  onFileChange: (file: File) => void;
  error?: string | null;
}

// Document icon component for reusability
const DocumentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// Info message component for reusability
const InfoMessage = ({ children }: { children: React.ReactNode }) => (
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
        <p className="text-sm text-blue-700">{children}</p>
      </div>
    </div>
  </div>
);

// Success message component for reusability
const SuccessMessage = ({ children }: { children: React.ReactNode }) => (
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
      <span className="text-sm text-green-700">{children}</span>
    </div>
  </div>
);

export default function DocumentUploadStep({
  file,
  onFileChange,
  error,
}: DocumentUploadStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 transition-all hover:border-[#5AC893]/50">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <DocumentIcon />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Upload Document
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Drag and drop your document here, or click to browse
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: PDF
              </p>
            </div>

            <div className="mt-6">
              <FileUpload onFileSelect={onFileChange} selectedFile={file} />
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {file && <SuccessMessage>Document ready for upload</SuccessMessage>}
          </div>
        </div>
      </div>

      <InfoMessage>
        Documents will be securely processed and encrypted. Only authorized
        recipients will be able to view and sign them.
      </InfoMessage>
    </div>
  );
}
