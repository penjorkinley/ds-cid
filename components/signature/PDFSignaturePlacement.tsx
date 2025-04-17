"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { nanoid } from "nanoid";
import RecipientSelectionModal from "./RecipientSelectionModal";
import { Recipient } from "@/components/signature/RecipientStep";
import { ResponsiveControlPanel } from "@/components/pdf-signature/SignatureControlPanel";
import { MobileInstructions } from "@/components/pdf-signature/SignatureMobileInstructions";
import { SignaturePlaceholderItem } from "@/components/pdf-signature/SignaturePlaceholderItem";
import { useScrollDrag } from "@/hooks/useScrollDrag";
import { PDFCoordinateUtils } from "@/utils/PDFCoordinateUtils";

// Set the worker source to the local file in the public directory
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// Enhanced SignaturePlaceholder with recipient information
export interface SignaturePlaceholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  recipientId: string;
  recipientName: string;
  order: number;
}

interface PageData {
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
}

interface PDFSignaturePlacementProps {
  file: File;
  onChange: (placeholders: SignaturePlaceholder[]) => void;
  placeholders: SignaturePlaceholder[];
  recipients: Recipient[];
}

export default function PDFSignaturePlacement({
  file,
  onChange,
  placeholders,
  recipients,
}: PDFSignaturePlacementProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startDragging, stopDragging } = useScrollDrag(containerRef);

  // Detect touch devices
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Add CSS for cursor styles
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      .signature-drag-handle { cursor: grab !important; }
      .signature-dragging { cursor: grabbing !important; }
      .signature-drag-handle * { cursor: grab !important; }
      .signature-dragging * { cursor: grabbing !important; }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Create URL for the PDF file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Calculate optimal zoom to fit the container
  const calculateOptimalZoom = useCallback(() => {
    return PDFCoordinateUtils.calculateOptimalZoom(containerRef, pdfDimensions);
  }, [pdfDimensions]);

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

  // Function to prevent wheel events from propagating outside the container
  const handleWheelEvent = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Update PDF dimensions when page loads
  const onPageLoadSuccess = (page: PageData) => {
    const width = page.originalWidth ?? page.width ?? 0;
    const height = page.originalHeight ?? page.height ?? 0;
    setPdfDimensions({ width, height });
  };

  // Convert screen coordinates (display) to PDF coordinates (storage)
  const convertScreenToPdfCoordinates = (
    screenX: number,
    screenY: number,
    height: number
  ) => {
    return PDFCoordinateUtils.convertScreenToPdfCoordinates(
      screenX,
      screenY,
      height,
      pdfDimensions,
      scale
    );
  };

  // Convert PDF coordinates (storage) to screen coordinates (display)
  const convertPdfToScreenCoordinates = (
    pdfX: number,
    pdfY: number,
    height: number
  ) => {
    return PDFCoordinateUtils.convertPdfToScreenCoordinates(
      pdfX,
      pdfY,
      height,
      pdfDimensions,
      scale
    );
  };

  // Get already assigned recipient IDs
  const getAssignedRecipientIds = (): string[] => {
    return placeholders.map((placeholder) => placeholder.recipientId);
  };

  // Get placeholder count (for the next placeholder)
  const getPlaceholderCount = (): number => {
    return placeholders.length + 1;
  };

  // Open the recipient selection modal
  const handleAddSignatory = () => {
    setIsModalOpen(true);
  };

  // Handle recipient selection from modal
  const handleRecipientSelect = (recipient: Recipient) => {
    // Calculate center position of the current view
    const containerRect = containerRef.current?.getBoundingClientRect();

    // Default values if container is not yet available
    let centerX = 100;
    let centerY = 100;
    const defaultHeight = 50 / scale;
    const defaultWidth = 100 / scale;

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

      // Center the placeholder
      centerX = pdfX - defaultWidth / 2;
      centerY = pdfY - defaultHeight / 2;

      // Ensure the placeholder is within bounds
      centerX = Math.max(
        0,
        Math.min(centerX, pdfDimensions.width - defaultWidth)
      );
      centerY = Math.max(
        0,
        Math.min(centerY, pdfDimensions.height - defaultHeight)
      );
    }

    // Convert to bottom-left coordinate system
    const bottomLeftCoords = convertScreenToPdfCoordinates(
      centerX * scale,
      centerY * scale,
      defaultHeight
    );

    // Create new placeholder with recipient information using bottom-left coordinates
    const newPlaceholder: SignaturePlaceholder = {
      id: nanoid(),
      x: bottomLeftCoords.x,
      y: bottomLeftCoords.y, // Distance from bottom of page
      width: defaultWidth,
      height: defaultHeight,
      pageNumber: currentPage,
      recipientId: recipient.id,
      recipientName: recipient.name,
      order: placeholders.length + 1,
    };

    onChange([...placeholders, newPlaceholder]);
    setIsModalOpen(false);
  };

  const handlePlaceholderChange = (
    id: string,
    update: Partial<SignaturePlaceholder>
  ) => {
    // Find the current placeholder to get its current properties
    const currentPlaceholder = placeholders.find((p) => p.id === id);
    if (!currentPlaceholder) return;

    // Create a normalized update object
    const normalizedUpdate: Partial<SignaturePlaceholder> = { ...update };

    // If position is being updated, normalize it and convert to bottom-left coordinates
    if (update.x !== undefined || update.y !== undefined) {
      const height =
        update.height !== undefined
          ? update.height / scale
          : currentPlaceholder.height;

      if (update.x !== undefined) {
        normalizedUpdate.x = update.x / scale;
      }

      if (update.y !== undefined) {
        // Convert from screen (top-left) to PDF (bottom-left) coordinates
        const pdfCoords = convertScreenToPdfCoordinates(
          update.x !== undefined ? update.x : currentPlaceholder.x * scale,
          update.y,
          height
        );

        // Update only the y coordinate
        normalizedUpdate.y = pdfCoords.y;
      }
    }

    // Normalize width and height
    if (update.width !== undefined) {
      normalizedUpdate.width = update.width / scale;
    }

    if (update.height !== undefined) {
      normalizedUpdate.height = update.height / scale;

      // If height changes but position doesn't, we need to update y to keep the bottom position fixed
      if (update.y === undefined) {
        // Calculate the updated y position (distance from bottom)
        const newY =
          pdfDimensions.height -
          (pdfDimensions.height -
            currentPlaceholder.y -
            currentPlaceholder.height +
            normalizedUpdate.height);

        normalizedUpdate.y = newY;
      }
    }

    // Update the placeholder
    const updatedPlaceholders = placeholders.map((p) =>
      p.id === id ? { ...p, ...normalizedUpdate } : p
    );

    onChange(updatedPlaceholders);
  };

  const handlePlaceholderRemove = (id: string) => {
    // Get the order of the placeholder to be removed
    const removedPlaceholder = placeholders.find((p) => p.id === id);
    if (!removedPlaceholder) return;

    const removedOrder = removedPlaceholder.order;

    // Filter out the removed placeholder and update the order of remaining placeholders
    const updatedPlaceholders = placeholders
      .filter((p) => p.id !== id)
      .map((p) => ({
        ...p,
        order: p.order > removedOrder ? p.order - 1 : p.order,
      }));

    onChange(updatedPlaceholders);
  };

  const handlePlaceholderDrag = () => {
    const elements = document.querySelectorAll(".signature-drag-handle");
    elements.forEach((el) => {
      el.classList.add("signature-dragging");
    });
  };

  const handlePlaceholderDragStop = (id: string, x: number, y: number) => {
    stopDragging();

    const elements = document.querySelectorAll(".signature-drag-handle");
    elements.forEach((el) => {
      el.classList.remove("signature-dragging");
    });

    handlePlaceholderChange(id, { x, y });
  };

  const handlePlaceholderResize = (
    id: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) => {
    handlePlaceholderChange(id, {
      width,
      height,
      x,
      y,
    });
  };

  // Filter placeholders for the current page
  const currentPagePlaceholders = placeholders.filter(
    (p) => p.pageNumber === currentPage
  );

  return (
    <div className="flex flex-col">
      <ResponsiveControlPanel
        scale={scale}
        setScale={setScale}
        resetZoom={resetZoom}
        handleAddSignatory={handleAddSignatory}
        numPages={numPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        placeholderCount={getPlaceholderCount()}
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
            {/* PDF Document */}
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
                // Convert from PDF coordinates (bottom-left) to screen coordinates (top-left)
                const screenCoords = convertPdfToScreenCoordinates(
                  placeholder.x,
                  placeholder.y,
                  placeholder.height
                );

                return (
                  <SignaturePlaceholderItem
                    key={placeholder.id}
                    placeholder={placeholder}
                    displayX={screenCoords.x}
                    displayY={screenCoords.y}
                    displayWidth={placeholder.width * scale}
                    displayHeight={placeholder.height * scale}
                    isTouchDevice={isTouchDevice}
                    onDragStart={startDragging}
                    onDrag={handlePlaceholderDrag}
                    onDragStop={(x, y) =>
                      handlePlaceholderDragStop(placeholder.id, x, y)
                    }
                    onResizeStop={(width, height, x, y) =>
                      handlePlaceholderResize(
                        placeholder.id,
                        width,
                        height,
                        x,
                        y
                      )
                    }
                    onRemove={handlePlaceholderRemove}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      <MobileInstructions />

      <div className="mt-4 text-sm hidden md:block">
        <strong>Instructions:</strong> Add signature placeholders by selecting
        recipients. Drag to position and resize the signature placeholders. Use
        the zoom controls to see the entire document. Click the red
        &quot;×&quot; button to remove a placeholder.
      </div>

      {/* Recipient Selection Modal */}
      <RecipientSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipients={recipients}
        onSelectRecipient={handleRecipientSelect}
        alreadyAssignedIds={getAssignedRecipientIds()}
        placeholderCount={getPlaceholderCount()}
      />
    </div>
  );
}
