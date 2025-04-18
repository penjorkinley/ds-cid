"use client";

import { useRef, useState, useEffect } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  acceptedFileTypes?: string;
  showFileTypeInfo?: boolean;
}

export default function FileUpload({
  onFileSelect,
  selectedFile,
  acceptedFileTypes = ".pdf",
  showFileTypeInfo = true,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Setup global drag and drop listeners to improve reliability
  useEffect(() => {
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Add listeners to the entire document
    window.addEventListener("dragenter", preventDefaults, false);
    window.addEventListener("dragover", preventDefaults, false);
    window.addEventListener("dragleave", preventDefaults, false);
    window.addEventListener("drop", preventDefaults, false);

    return () => {
      window.removeEventListener("dragenter", preventDefaults, false);
      window.removeEventListener("dragover", preventDefaults, false);
      window.removeEventListener("dragleave", preventDefaults, false);
      window.removeEventListener("drop", preventDefaults, false);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      validateAndSelectFile(files[0]);
    }
  };

  const validateAndSelectFile = (file: File) => {
    setFileError(null);
    // Check if the file is a PDF
    if (
      acceptedFileTypes === ".pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setFileError("Only PDF files are supported");
      return;
    }
    onFileSelect(file);
  };

  // Improved drag handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Always set to true on dragover to ensure the highlight stays active
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if we're leaving the drop area, not just moving between children
    if (e.currentTarget === e.target) {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div
        ref={dropAreaRef}
        className={`w-full h-28 sm:h-36 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragActive
            ? "border-[#5AC893] bg-[#5AC893]/10"
            : "border-gray-300 hover:border-[#5AC893]"
        }`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedFileTypes}
        />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-8 w-8 mb-2 ${
            dragActive ? "text-[#5AC893]" : "text-gray-400"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="text-gray-600 text-center">
          {selectedFile ? (
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-[#5AC893]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="truncate max-w-xs">{selectedFile.name}</span>
            </span>
          ) : (
            <>
              <span className="font-medium block">
                Drag and drop your file here
              </span>
              <span className="text-sm text-gray-500 block mt-1">
                or click to browse
              </span>
              {showFileTypeInfo && (
                <span className="text-xs text-blue-600 font-medium block mt-1">
                  Only PDF files supported
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {selectedFile && (
        <div className="text-base text-gray-500 flex justify-between items-center px-1">
          <span>Size: {formatFileSize(selectedFile.size)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null as unknown as File);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}

      {fileError && (
        <div className="text-sm text-red-600 px-1">{fileError}</div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
