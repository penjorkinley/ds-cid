"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { SignaturePlaceholder } from "@/components/signature/SignatureStepsForm";
import { nanoid } from "nanoid";

// Set the worker source to the local file in the public directory
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFSignaturePlacementProps {
  file: File;
  onChange: (placeholders: SignaturePlaceholder[]) => void;
  placeholders: SignaturePlaceholder[];
}

export default function PDFSignaturePlacement({
  file,
  onChange,
  placeholders,
}: PDFSignaturePlacementProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create URL for the PDF file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleAddPlaceholder = () => {
    const newPlaceholder: SignaturePlaceholder = {
      id: nanoid(),
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      pageNumber: currentPage,
    };

    onChange([...placeholders, newPlaceholder]);
  };

  const handlePlaceholderChange = (
    id: string,
    update: Partial<SignaturePlaceholder>
  ) => {
    const updatedPlaceholders = placeholders.map((p) =>
      p.id === id ? { ...p, ...update } : p
    );
    onChange(updatedPlaceholders);
  };

  const handlePlaceholderRemove = (id: string) => {
    onChange(placeholders.filter((p) => p.id !== id));
  };

  const currentPagePlaceholders = placeholders.filter(
    (p) => p.pageNumber === currentPage
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
            className="px-3 py-1 bg-gray-200 rounded"
            disabled={scale <= 0.5}
          >
            -
          </button>
          <span className="px-3 py-1">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
            className="px-3 py-1 bg-gray-200 rounded"
            disabled={scale >= 2}
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddPlaceholder}
          className="px-4 py-1 text-white bg-[#5AC893] rounded hover:bg-[#4ba578]"
        >
          Add Signature Field
        </button>
      </div>

      {numPages && (
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-4 py-1">
            Page {currentPage} of {numPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(numPages, prev + 1))
            }
            disabled={numPages !== null && currentPage >= numPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative border border-gray-300 rounded-md overflow-auto"
        style={{ height: "70vh" }}
      >
        {fileUrl && (
          <div className="flex justify-center">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="p-4">Loading PDF...</div>}
              error={<div className="p-4 text-red-500">Failed to load PDF</div>}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        )}

        {/* Signature placeholders layer */}
        <div className="absolute inset-0 pointer-events-none">
          {currentPagePlaceholders.map((placeholder) => (
            <Rnd
              key={placeholder.id}
              className="pointer-events-auto"
              position={{ x: placeholder.x, y: placeholder.y }}
              size={{ width: placeholder.width, height: placeholder.height }}
              onDragStop={(e, d) => {
                handlePlaceholderChange(placeholder.id, { x: d.x, y: d.y });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                handlePlaceholderChange(placeholder.id, {
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  x: position.x,
                  y: position.y,
                });
              }}
              bounds="parent"
            >
              <div className="relative w-full h-full border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-20 flex items-center justify-center">
                <span className="text-sm text-blue-700">Signature</span>
                <button
                  type="button"
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={() => handlePlaceholderRemove(placeholder.id)}
                >
                  ×
                </button>
              </div>
            </Rnd>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm">
        <strong>Instructions:</strong> Drag to position and resize the signature
        placeholders. Add as many as needed.
      </div>
    </div>
  );
}
