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
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to prevent wheel events from propagating outside the container
  const handleWheelEvent = (e: React.WheelEvent<HTMLDivElement>) => {
    // Don't prevent the default scroll behavior, just stop propagation
    e.stopPropagation();
  };

  // Add CSS for cursor styles
  useEffect(() => {
    // Add our custom styles to the document
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      .signature-drag-handle {
        cursor: grab !important;
      }
      .signature-dragging {
        cursor: grabbing !important;
      }
      .signature-drag-handle * {
        cursor: grab !important;
      }
      .signature-dragging * {
        cursor: grabbing !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Cleanup function
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Track mouse position only when dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  // Cleanup function for any active timers
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearInterval(scrollTimerRef.current);
      }
    };
  }, []);

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

  // Auto-fit PDF when dimensions are available
  useEffect(() => {
    if (
      pdfDimensions.width > 0 &&
      pdfDimensions.height > 0 &&
      !initialLoadComplete
    ) {
      resetZoom();
      setInitialLoadComplete(true);
    }
  }, [pdfDimensions, initialLoadComplete]);

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

  // Convert top-left coordinates to bottom-left
  const toBottomLeftCoordinates = (x: number, y: number) => {
    return {
      x,
      y: pdfDimensions.height - y, // Invert the y-coordinate
    };
  };

  // Convert bottom-left coordinates to top-left
  const toTopLeftCoordinates = (x: number, y: number) => {
    return {
      x,
      y: pdfDimensions.height - y, // Invert the y-coordinate back
    };
  };

  const handleAddPlaceholder = () => {
    // Calculate center position of the current view
    const containerRect = containerRef.current?.getBoundingClientRect();

    // Default values if container is not yet available
    let centerX = 100;
    let centerY = 100;

    if (containerRect && pdfDimensions.width > 0) {
      // Calculate center of the visible area
      const visibleCenterX =
        containerRef.current?.scrollLeft || 0 + containerRect.width / 2;
      const visibleCenterY =
        containerRef.current?.scrollTop || 0 + containerRect.height / 2;

      // Convert to PDF coordinates (normalized to scale=1)
      // The PDF is centered, so we need to adjust for that
      const pdfX =
        (visibleCenterX -
          containerRect.width / 2 +
          (pdfDimensions.width * scale) / 2) /
        scale;
      const pdfY = (visibleCenterY - 24) / scale; // 24px accounts for mt-6 top margin

      // Center the placeholder (half width and height)
      centerX = pdfX - 100 / scale;
      centerY = pdfY - 50 / scale;

      // Ensure the placeholder is within bounds
      centerX = Math.max(
        0,
        Math.min(centerX, pdfDimensions.width - 200 / scale)
      );
      centerY = Math.max(
        0,
        Math.min(centerY, pdfDimensions.height - 100 / scale)
      );

      // Convert to bottom-left coordinate system
      const bottomLeftCoords = toBottomLeftCoordinates(centerX, centerY);
      centerX = bottomLeftCoords.x;
      centerY = bottomLeftCoords.y;
    }

    const newPlaceholder: SignaturePlaceholder = {
      id: nanoid(),
      x: centerX,
      y: centerY, // This is now in bottom-left coordinates
      width: 100 / scale, // Store normalized width
      height: 50 / scale, // Store normalized height
      pageNumber: currentPage,
    };

    onChange([...placeholders, newPlaceholder]);
  };

  const handlePlaceholderChange = (
    id: string,
    update: Partial<SignaturePlaceholder>
  ) => {
    // If position is being updated, normalize it to scale=1
    // and convert to bottom-left coordinates
    const normalizedUpdate = { ...update };

    if (update.x !== undefined || update.y !== undefined) {
      // Get the current coordinates
      let updateX = update.x !== undefined ? update.x / scale : undefined;
      let updateY = update.y !== undefined ? update.y / scale : undefined;

      // If we have a Y update, convert it to bottom-left coordinate system
      if (updateY !== undefined) {
        updateY = pdfDimensions.height - updateY;
      }

      normalizedUpdate.x = updateX;
      normalizedUpdate.y = updateY;
    }

    if (update.width !== undefined || update.height !== undefined) {
      normalizedUpdate.width =
        update.width !== undefined ? update.width / scale : undefined;
      normalizedUpdate.height =
        update.height !== undefined ? update.height / scale : undefined;
    }

    const updatedPlaceholders = placeholders.map((p) =>
      p.id === id ? { ...p, ...normalizedUpdate } : p
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
    if (!containerRef.current || !pdfDimensions.width || !pdfDimensions.height)
      return 1;

    const containerWidth = containerRef.current.clientWidth - 40; // Subtract padding
    const containerHeight = containerRef.current.clientHeight - 40; // Subtract padding

    const widthRatio = containerWidth / pdfDimensions.width;
    const heightRatio = containerHeight / pdfDimensions.height;

    // Use the smaller ratio to ensure both dimensions fit
    return Math.min(widthRatio, heightRatio, 1); // Limit max zoom to 100%
  };

  const resetZoom = () => {
    const optimalZoom = calculateOptimalZoom();
    setScale(optimalZoom);
  };

  // Modified auto-scroll function with reduced sensitivity
  const handleDragWithScroll = () => {
    if (!isDragging) return; // Only auto-scroll during drag operations

    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const scrollMargin = 30; // Reduced from 50
      const scrollSpeed = 8; // Reduced from 15

      // Vertical scrolling
      if (mousePosition.y > containerRect.bottom - scrollMargin) {
        container.scrollTop += scrollSpeed;
      }

      if (mousePosition.y < containerRect.top + scrollMargin) {
        container.scrollTop -= scrollSpeed;
      }

      // Horizontal scrolling
      if (mousePosition.x > containerRect.right - scrollMargin) {
        container.scrollLeft += scrollSpeed;
      }

      if (mousePosition.x < containerRect.left + scrollMargin) {
        container.scrollLeft -= scrollSpeed;
      }
    }
  };

  // Start a timer to periodically check if we need to scroll during drag
  const startScrollTimer = () => {
    // Clear any existing timer first
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
    }

    scrollTimerRef.current = setInterval(() => {
      handleDragWithScroll();
    }, 50);

    return scrollTimerRef.current;
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
        className="relative border-2 border-gray-400 rounded-lg overflow-auto bg-gray-100"
        style={{ height: "calc(85vh - 150px)", minHeight: "500px" }}
        id="pdf-container"
        onWheel={handleWheelEvent}
      >
        {fileUrl && (
          <div
            ref={pdfContainerRef}
            className="relative"
            style={{
              minWidth: pdfDimensions.width * scale + 40,
              minHeight: pdfDimensions.height * scale + 40,
              display: "flex",
              justifyContent: "center",
            }}
          >
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
                className="shadow-lg mt-6 mb-6"
              />
            </Document>

            {/* Signature placeholders layer */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: pdfDimensions.width * scale,
                height: pdfDimensions.height * scale,
                top: 24, // account for mt-6 (1.5rem = 24px)
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {currentPagePlaceholders.map((placeholder) => {
                // First convert from bottom-left to top-left coordinates
                const topLeftCoords = toTopLeftCoordinates(
                  placeholder.x,
                  placeholder.y
                );

                // Then scale for display
                const displayX = topLeftCoords.x * scale;
                const displayY = topLeftCoords.y * scale;
                const displayWidth = placeholder.width * scale;
                const displayHeight = placeholder.height * scale;

                return (
                  <Rnd
                    key={placeholder.id}
                    className="pointer-events-auto"
                    position={{ x: displayX, y: displayY }}
                    size={{ width: displayWidth, height: displayHeight }}
                    onDragStart={() => {
                      setIsDragging(true);
                      startScrollTimer();
                    }}
                    onDrag={() => {
                      // Make sure we have the grabbing cursor during drag
                      const elements = document.querySelectorAll(
                        ".signature-drag-handle"
                      );
                      elements.forEach((el) => {
                        el.classList.add("signature-dragging");
                      });
                    }}
                    onDragStop={(e, d) => {
                      setIsDragging(false);
                      if (scrollTimerRef.current) {
                        clearInterval(scrollTimerRef.current);
                      }

                      // Remove the grabbing cursor class
                      const elements = document.querySelectorAll(
                        ".signature-drag-handle"
                      );
                      elements.forEach((el) => {
                        el.classList.remove("signature-dragging");
                      });

                      // Store normalized position in bottom-left coordinates
                      // The conversion from top-left to bottom-left happens in handlePlaceholderChange
                      handlePlaceholderChange(placeholder.id, {
                        x: d.x,
                        y: d.y,
                      });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      // Store normalized size and position in bottom-left coordinates
                      handlePlaceholderChange(placeholder.id, {
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                        x: position.x,
                        y: position.y,
                      });
                    }}
                    bounds="parent"
                    dragHandleClassName="signature-drag-handle"
                  >
                    <div className="relative w-full h-full border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-50 flex items-center justify-center signature-drag-handle">
                      <span className="text-sm font-medium text-blue-700 pointer-events-none">
                        Signature
                      </span>
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
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm">
        <strong>Instructions:</strong> Drag to position and resize the signature
        placeholders. Add as many as needed. Use the zoom controls to see the
        entire document. Click the red "×" button to remove a placeholder.
      </div>
    </div>
  );
}
