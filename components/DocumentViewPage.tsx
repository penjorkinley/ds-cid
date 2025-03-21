"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Button from "@/components/ui/Button";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentData {
  documentId: string;
  documentHash: string;
  documentUrl: string;
  name: string;
  cid: string;
  organizationId: string;
  signatureCoordinates: string;
}

export default function DocumentViewPage({
  params,
}: {
  params: { documentId: string };
}) {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [signingMode, setSigningMode] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [action, setAction] = useState<"sign" | "reject" | null>(null);

  const { documentId } = params;

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setLoading(true);
        // This would be your actual API endpoint to fetch document data
        const response = await fetch(`/api/documents/${documentId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }

        const data = await response.json();
        setDocumentData(data);
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

  const handleSignClick = () => {
    setSigningMode(true);
    setAction("sign");
  };

  const handleRejectClick = () => {
    setAction("reject");
    setSubmitting(true);

    // Simulating API call to reject document
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleSignatureSubmit = async () => {
    if (!signature) return;

    setSubmitting(true);

    // Simulating API call to submit signature
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  // Function to draw on canvas
  const initializeCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("mousedown", (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDrawing) return;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener("mouseup", () => {
      isDrawing = false;
      // Save the signature as base64
      setSignature(canvas.toDataURL());
    });

    canvas.addEventListener("mouseout", () => {
      isDrawing = false;
    });
  };

  const handleClearSignature = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignature(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5AC893]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Error Loading Document
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
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
            {action === "sign"
              ? "Document Signed Successfully"
              : "Document Rejected"}
          </h2>
          <p className="text-gray-600 mb-6">
            {action === "sign"
              ? "Thank you for signing the document. The sender has been notified."
              : "The document has been rejected. The sender has been notified."}
          </p>
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-[#5AC893] text-white rounded-md hover:bg-[#4ba578]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Document Signature Request
      </h1>

      {signingMode ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Draw Your Signature</h2>
          <div className="border-2 border-dashed border-gray-300 p-2 rounded-md mb-4">
            <canvas
              id="signature-pad"
              width="600"
              height="200"
              className="bg-white border border-gray-200 w-full"
              ref={(canvas) => {
                if (canvas) initializeCanvas(canvas);
              }}
            ></canvas>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => {
                const canvas = document.getElementById(
                  "signature-pad"
                ) as HTMLCanvasElement;
                if (canvas) handleClearSignature(canvas);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
            <div className="space-x-3">
              <button
                onClick={() => setSigningMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignatureSubmit}
                disabled={!signature || submitting}
                className={`px-4 py-2 rounded-md text-white ${
                  !signature || submitting
                    ? "bg-gray-400"
                    : "bg-[#5AC893] hover:bg-[#4ba578]"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
      ) : (
        <div className="flex flex-col space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <h2 className="font-semibold">Document Preview</h2>
                <p className="text-sm text-gray-500">
                  Page {pageNumber} of {numPages || "?"}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded hover:bg-gray-100"
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
              {documentData && (
                <Document
                  file={documentData.documentUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="w-full"
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              )}
            </div>

            <div className="p-4 border-t flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNumber <= 1}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages!}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Document ID</p>
                <p className="font-mono">{documentData?.documentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recipient Name</p>
                <p>{documentData?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Document Hash</p>
                <p className="font-mono text-xs truncate">
                  {documentData?.documentHash}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CID</p>
                <p className="font-mono text-xs truncate">
                  {documentData?.cid}
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRejectClick}
                disabled={submitting}
                className="px-6 py-3 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
              >
                {submitting && action === "reject" ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500"
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
                onClick={handleSignClick}
                disabled={submitting}
                className="px-6 py-3 bg-[#5AC893] text-white rounded-md hover:bg-[#4ba578]"
              >
                Sign Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
