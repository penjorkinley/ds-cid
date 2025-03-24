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
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Create URL for the PDF file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Update container size when window resizes
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    // Initial size
    updateContainerSize();

    // Attach resize handler
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Update PDF dimensions when page loads
  const onPageLoadSuccess = (page: any) => {
    const { width, height } = page.originalWidth
      ? { width: page.originalWidth, height: page.originalHeight }
      : { width: page.width, height: page.height };

    setPdfDimensions({ width, height });
  };

  const handleAddPlaceholder = () => {
    // Calculate center position of the current view
    const containerRect = containerRef.current?.getBoundingClientRect();
    const centerX = containerRect ? containerRect.width / 2 - 100 : 100; // 100 is half the placeholder width
    const centerY = containerRect
      ? Math.min(
          containerRect.height / 2 - 50,
          containerRef.current?.scrollTop || 0 + 100
        )
      : 100;

    const newPlaceholder: SignaturePlaceholder = {
      id: nanoid(),
      x: centerX,
      y: centerY,
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

  // Calculate optimal zoom to fit the container
  const calculateOptimalZoom = () => {
    if (!containerRef.current || !pdfDimensions.width) return 1;

    const containerWidth = containerRef.current.clientWidth - 40; // Subtract padding
    const pdfWidth = pdfDimensions.width;

    return Math.min(containerWidth / pdfWidth, 1); // Limit max zoom to 100%
  };

  const resetZoom = () => {
    const optimalZoom = calculateOptimalZoom();
    setScale(optimalZoom);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setScale((prev) => Math.max(0.3, prev - 0.1))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={scale <= 0.3}
          >
            -
          </button>
          <span className="px-3 py-1">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={scale >= 2}
          >
            +
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Fit to window"
          >
            Fit
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddPlaceholder}
          className="px-4 py-1 text-white bg-[#5AC893] rounded hover:bg-[#4ba578] transition-colors"
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
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="mx-4 py-1">
            Page {currentPage} of {numPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(numPages as number, prev + 1))
            }
            disabled={numPages !== null && currentPage >= numPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative border border-gray-300 rounded-md overflow-auto"
        style={{ height: "calc(85vh - 150px)", minHeight: "500px" }}
      >
        {fileUrl && (
          <div className="flex flex-col items-center">
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
                onLoadSuccess={onPageLoadSuccess}
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
                  className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center z-50 hover:bg-red-600 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handlePlaceholderRemove(placeholder.id);
                  }}
                  aria-label="Remove signature placeholder"
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
        placeholders. Add as many as needed. Use the zoom controls to see the
        entire document. Click the red "×" button to remove a placeholder.
      </div>
    </div>
  );
}
