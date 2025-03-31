"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { SignaturePlaceholder } from "@/components/signature/SignatureStepsForm";
import { nanoid } from "nanoid";

// Set the worker source to the local file in the public directory
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface ResponsiveControlPanelProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  resetZoom: () => void;
  handleAddPlaceholder: () => void;
  numPages: number | null;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

// Responsive control panel component
const ResponsiveControlPanel: React.FC<ResponsiveControlPanelProps> = ({
  scale,
  setScale,
  resetZoom,
  handleAddPlaceholder,
  numPages,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-4">
      {/* Zoom controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={() => setScale((prev) => Math.max(0.3, prev - 0.1))}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={scale <= 0.3}
            aria-label="Zoom out"
          >
            <span className="text-lg font-bold">-</span>
          </button>
          <span className="px-1 sm:px-3 py-1 text-sm sm:text-base">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={scale >= 2}
            aria-label="Zoom in"
          >
            <span className="text-lg font-bold">+</span>
          </button>
          {/* Updated Fit button - now larger and more consistent with other controls */}
          <button
            type="button"
            onClick={resetZoom}
            className="w-10 h-8 sm:w-14 sm:h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-xs sm:text-sm font-medium"
            title="Fit to window"
          >
            Fit
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddPlaceholder}
          className="px-3 sm:px-4 py-2 text-white bg-[#5AC893] rounded hover:bg-[#4ba578] transition-colors text-sm sm:text-base flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Add signature
        </button>
      </div>

      {/* Page navigation */}
      {numPages && (
        <div className="flex justify-center items-center">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <span className="mx-2 sm:mx-4 py-1 text-sm sm:text-base whitespace-nowrap">
            Page {currentPage} of {numPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(numPages, prev + 1))
            }
            disabled={numPages !== null && currentPage >= numPages}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

// Instructions for mobile users
const MobileInstructions: React.FC = () => {
  return (
    <div className="mt-4 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 md:hidden">
      <strong className="text-blue-700">Tips:</strong>
      <ul className="list-disc ml-5 mt-1 text-blue-600 space-y-1">
        <li>Pinch to zoom in/out on the document</li>
        <li>Tap and hold to drag signature fields</li>
        <li>Tap corners to resize fields</li>
        <li>Use the red × to remove fields</li>
      </ul>
    </div>
  );
};

interface PDFSignaturePlacementProps {
  file: File;
  onChange: (placeholders: SignaturePlaceholder[]) => void;
  placeholders: SignaturePlaceholder[];
}

interface PageData {
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch devices
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Function to prevent wheel events from propagating outside the container
  const handleWheelEvent = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Add CSS for cursor styles
  useEffect(() => {
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
      // Just keeping the function as a placeholder
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  // Calculate optimal zoom to fit the container
  const calculateOptimalZoom = useCallback(() => {
    if (!containerRef.current || !pdfDimensions.width || !pdfDimensions.height)
      return 1;

    const containerWidth = containerRef.current.clientWidth - 40; // Subtract padding
    const containerHeight = containerRef.current.clientHeight - 40; // Subtract padding

    const widthRatio = containerWidth / pdfDimensions.width;
    const heightRatio = containerHeight / pdfDimensions.height;

    // Use the smaller ratio to ensure both dimensions fit
    return Math.min(widthRatio, heightRatio, 1); // Limit max zoom to 100%
  }, [pdfDimensions.width, pdfDimensions.height]);

  const resetZoom = useCallback(() => {
    const optimalZoom = calculateOptimalZoom();
    setScale(optimalZoom);
  }, [calculateOptimalZoom]);

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
  }, [pdfDimensions, initialLoadComplete, resetZoom]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Update PDF dimensions when page loads
  const onPageLoadSuccess = (page: PageData) => {
    const width = page.originalWidth ?? page.width ?? 0;
    const height = page.originalHeight ?? page.height ?? 0;

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
        (containerRef.current?.scrollLeft || 0) + containerRect.width / 2;
      const visibleCenterY =
        (containerRef.current?.scrollTop || 0) + containerRect.height / 2;

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
      const updateX = update.x !== undefined ? update.x / scale : undefined;
      const updateY = update.y !== undefined ? update.y / scale : undefined;

      // If we have a Y update, convert it to bottom-left coordinate system
      if (updateY !== undefined) {
        normalizedUpdate.y = pdfDimensions.height - updateY;
      }

      normalizedUpdate.x = updateX;
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
    console.log("Removing placeholder with ID:", id);
    onChange(placeholders.filter((p) => p.id !== id));
  };

  const currentPagePlaceholders = placeholders.filter(
    (p) => p.pageNumber === currentPage
  );

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
      <ResponsiveControlPanel
        scale={scale}
        setScale={setScale}
        resetZoom={resetZoom}
        handleAddPlaceholder={handleAddPlaceholder}
        numPages={numPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div
        ref={containerRef}
        className="relative border-2 border-gray-400 rounded-lg overflow-auto bg-gray-100"
        style={{
          height: isTouchDevice ? "calc(70vh - 150px)" : "calc(85vh - 150px)",
          minHeight: "400px",
        }}
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
              loading={<div className="p-4 text-center">Loading PDF...</div>}
              error={
                <div className="p-4 text-red-500 text-center">
                  Failed to load PDF
                </div>
              }
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
              className="absolute"
              style={{
                width: pdfDimensions.width * scale,
                height: pdfDimensions.height * scale,
                top: 24, // account for mt-6 (1.5rem = 24px)
                left: "50%",
                transform: "translateX(-50%)",
                pointerEvents: "none",
                zIndex: 10,
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
                    position={{ x: displayX, y: displayY }}
                    size={{ width: displayWidth, height: displayHeight }}
                    onDragStart={() => {
                      setIsDragging(true);
                      startScrollTimer();
                    }}
                    onDrag={() => {
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

                      const elements = document.querySelectorAll(
                        ".signature-drag-handle"
                      );
                      elements.forEach((el) => {
                        el.classList.remove("signature-dragging");
                      });

                      handlePlaceholderChange(placeholder.id, {
                        x: d.x,
                        y: d.y,
                      });
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
                    dragHandleClassName="signature-drag-handle"
                    resizeHandleStyles={{
                      bottomRight: {
                        width: isTouchDevice ? "24px" : "10px",
                        height: isTouchDevice ? "24px" : "10px",
                        right: isTouchDevice ? "-12px" : "-5px",
                        bottom: isTouchDevice ? "-12px" : "-5px",
                        background: "rgba(0, 0, 255, 0.4)",
                        borderRadius: "50%",
                      },
                    }}
                    className="pointer-events-auto"
                  >
                    <div className="relative w-full h-full border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-50 flex items-center justify-center signature-drag-handle">
                      <span className="text-xs sm:text-sm font-medium text-blue-700 pointer-events-none">
                        Signature
                      </span>

                      {/* Delete button - improved for mobile */}
                      <div
                        className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-50 touch-manipulation"
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          handlePlaceholderRemove(placeholder.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <button
                          type="button"
                          className="w-8 h-8 sm:w-9 sm:h-9 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md border-2 border-white focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handlePlaceholderRemove(placeholder.id);
                          }}
                          aria-label="Remove signature field"
                        >
                          <span className="text-xl font-bold">×</span>
                        </button>
                      </div>
                    </div>
                  </Rnd>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <MobileInstructions />

      <div className="mt-4 text-sm hidden md:block">
        <strong>Instructions:</strong> Drag to position and resize the signature
        placeholders. Use the zoom controls to see the entire document. Click
        the red &quot;×&quot; button to remove a placeholder.
      </div>
    </div>
  );
}
