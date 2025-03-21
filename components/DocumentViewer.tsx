"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentData {
  documentId: string;
  documentHash: string;
  documentUrl: string;
  name: string;
  email: string;
  cid: string;
  organizationId: string;
  signatureCoordinates: string;
}

interface DocumentViewerProps {
  documentId: string;
}

export default function DocumentViewer({ documentId }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [signingOrRejecting, setSigningOrRejecting] = useState(false);
  const [success, setSuccess] = useState<{
    status: "signed" | "rejected" | null;
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setLoading(true);
        // Fetch the document data from your API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/documents/${documentId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }

        const data = await response.json();
        setDocumentData(data);

        // Set the document URL for viewing
        setDocumentUrl(data.documentUrl);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load document"
        );
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocumentData();
    }
  }, [documentId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

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

  const handleSignButtonClick = async () => {
    try {
      setSigningOrRejecting(true);

      // Call your API to sign the document
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/documents/${documentId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sign document: ${response.statusText}`);
      }

      setSuccess({
        status: "signed",
        message:
          "You have chosen to sign this document. You will be redirected to the signature process.",
      });

      // In a real implementation, you might redirect to a signature page
      // window.location.href = `${apiUrl}/sign-document/${documentId}`;
    } catch (err) {
      console.error("Error signing document:", err);
      setError(err instanceof Error ? err.message : "Failed to sign document");
    } finally {
      setSigningOrRejecting(false);
    }
  };

  const handleRejectButtonClick = async () => {
    try {
      setSigningOrRejecting(true);

      // Call your API to reject the document
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/documents/${documentId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reject document: ${response.statusText}`);
      }

      setSuccess({
        status: "rejected",
        message: "Document has been rejected successfully",
      });
    } catch (err) {
      console.error("Error rejecting document:", err);
      setError(
        err instanceof Error ? err.message : "Failed to reject document"
      );
    } finally {
      setSigningOrRejecting(false);
    }
  };

  // Render a loading state
  if (loading) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5AC893] mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Render an error state
  if (error) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          <h3 className="text-lg font-medium mb-2">Error Loading Document</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render a success state (after signing or rejecting)
  if (success) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {success.status === "signed"
              ? "Document Signing Initiated"
              : "Document Rejected"}
          </h2>
          <p className="text-gray-600 mb-6">{success.message}</p>
          <p className="text-gray-500">You may now close this window.</p>
        </div>
      </div>
    );
  }

  // Main document viewer
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-2 sm:mb-0">
            <h2 className="text-xl font-semibold">Document for Review</h2>
            <p className="text-sm text-gray-500">
              Please review the document before signing
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded hover:bg-gray-100"
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
              className="p-2 rounded hover:bg-gray-100"
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

        <div className="p-4 flex justify-center">
          {documentUrl && (
            <Document
              file={documentUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="w-full"
              error={
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                  <p>Failed to load PDF file. Please try again later.</p>
                </div>
              }
              loading={
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5AC893]"></div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                error={
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                    <p>Failed to render page {pageNumber}.</p>
                  </div>
                }
              />
            </Document>
          )}
        </div>

        <div className="p-4 border-t flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <button
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
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
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Document Information and Action Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Document Information</h3>
        {documentData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Document ID</p>
              <p className="font-mono text-sm">{documentData.documentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recipient</p>
              <p>{documentData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CID</p>
              <p className="font-mono text-sm truncate">{documentData.cid}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Organization ID</p>
              <p>{documentData.organizationId}</p>
            </div>
          </div>
        )}

        {/* Signature Placeholder Indicator */}
        {documentData?.signatureCoordinates && (
          <div className="p-3 mb-6 bg-blue-50 border border-blue-200 rounded-md text-blue-600 text-sm">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium mb-1">E-Signature Placeholder</p>
                <p>
                  A signature placeholder has been set at position:{" "}
                  {documentData.signatureCoordinates}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleRejectButtonClick}
            disabled={signingOrRejecting}
            className="px-6 py-3 border border-red-500 text-red-500 font-medium rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {signingOrRejecting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-red-500"
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
              "Reject Document"
            )}
          </button>
          <button
            onClick={handleSignButtonClick}
            disabled={signingOrRejecting}
            className="px-6 py-3 bg-[#5AC893] text-white font-medium rounded-md hover:bg-[#4ba578] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5AC893]"
          >
            {signingOrRejecting ? (
              <span className="flex items-center justify-center">
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
              "Sign Document"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
