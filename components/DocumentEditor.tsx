// components/DocumentEditor.tsx
"use client";

// Import the Document component from react-pdf
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

// Import pdfjs separately
import * as pdfjs from "pdfjs-dist";

// Initialize pdfjs worker - use a specific version that exists
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

interface DocumentEditorProps {
  file: File;
  onPlaceholderSet: (coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<any>) => void; // Changed to any
  isSubmitting: boolean;
}

export default function DocumentEditor({
  file,
  onPlaceholderSet,
  onClose,
  onSubmit,
  isSubmitting,
}: DocumentEditorProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [placeholderPos, setPlaceholderPos] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Log PDF.js version to console for debugging
    console.log("PDF.js version:", pdfjs.version);

    if (file) {
      try {
        console.log(
          "Loading PDF file:",
          file.name,
          "Size:",
          file.size,
          "Type:",
          file.type
        );
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error creating object URL:", error);
        setLoadError("Failed to load the PDF file");
      }
    }
  }, [file]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("PDF loaded successfully with", numPages, "pages");
    setNumPages(numPages);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setLoadError(`Failed to load PDF file: ${error.message}`);
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !startPos || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(startPos.x, e.clientX - rect.left);
    const y = Math.min(startPos.y, e.clientY - rect.top);
    const width = Math.abs(e.clientX - rect.left - startPos.x);
    const height = Math.abs(e.clientY - rect.top - startPos.y);
    setPlaceholderPos({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSetPlaceholder = () => {
    if (placeholderPos) {
      onPlaceholderSet(placeholderPos);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < numPages!) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleZoomIn = () => {
    setScale(scale + 0.2);
  };

  const handleZoomOut = () => {
    if (scale > 0.4) {
      setScale(scale - 0.2);
    }
  };

  const handleSubmit = () => {
    if (placeholderPos) {
      handleSetPlaceholder();
      // Create a minimal form event
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;

      onSubmit(syntheticEvent);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center z-50 p-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
        {/* Header with logo */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 relative mb-2">
            <Image
              src="/ndi-logo.jpeg"
              alt="Bhutan NDI Digital Signature Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-center text-[#141B29]">
            Bhutan NDI Digital Signature Portal
          </h1>
          <p className="text-sm text-center text-gray-600 mt-2">
            Drag and drop the e-signature placeholder in your designated area of
            the document
          </p>
        </div>

        {/* Document container with border */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto relative border-2 border-gray-300 rounded-lg mb-4"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {fileUrl ? (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="flex justify-center"
              loading={
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5AC893]"></div>
                </div>
              }
              error={
                <div className="p-4 text-center text-red-600">
                  Failed to load PDF file. Please make sure the file is a valid
                  PDF.
                </div>
              }
            >
              {loadError ? (
                <div className="p-4 text-center text-red-600">{loadError}</div>
              ) : (
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              )}
            </Document>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading document...</p>
            </div>
          )}

          {placeholderPos && (
            <div
              className="absolute border-2 border-green-500 bg-green-100 bg-opacity-30 pointer-events-none flex items-center justify-center"
              style={{
                left: placeholderPos.x,
                top: placeholderPos.y,
                width: placeholderPos.width,
                height: placeholderPos.height,
              }}
            >
              <span className="text-xs font-semibold bg-white px-1 rounded">
                e-SIGNATURE PLACEHOLDER
              </span>
            </div>
          )}
        </div>

        {/* Navigation controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              type="button"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {pageNumber} of {numPages || "?"}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!numPages || pageNumber >= numPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              type="button"
            >
              Next
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-100"
              type="button"
              aria-label="Zoom out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-100"
              type="button"
              aria-label="Zoom in"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between mb-4">
          <div className="border border-gray-300 rounded-md py-2 px-4 inline-flex items-center">
            <span className="text-sm font-medium">e-SIGNATURE PLACEHOLDER</span>
            {placeholderPos && (
              <span className="ml-2 text-xs text-gray-500">
                ({placeholderPos.x.toFixed(0)}, {placeholderPos.y.toFixed(0)})
              </span>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!placeholderPos || isSubmitting}
              className={`px-5 py-2 rounded-md text-white ${
                placeholderPos && !isSubmitting
                  ? "bg-[#5AC893] hover:bg-[#4ba578]"
                  : "bg-gray-400"
              }`}
              type="button"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
