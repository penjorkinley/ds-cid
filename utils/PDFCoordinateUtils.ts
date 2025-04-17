import { RefObject } from "react";

export interface PdfDimensions {
  width: number;
  height: number;
}

export class PDFCoordinateUtils {
  /**
   * Converts screen coordinates (display) to PDF coordinates (storage)
   * This function converts from the displayed top-left to the stored bottom-left format
   */
  static convertScreenToPdfCoordinates(
    screenX: number,
    screenY: number,
    height: number,
    pdfDimensions: PdfDimensions,
    scale: number
  ) {
    // First normalize for scale
    const normalizedX = screenX / scale;
    const normalizedY = screenY / scale;

    // Calculate distance from bottom of page to bottom of the signature box
    // When a box is at the bottom edge of the page, we want y = 0
    const bottomY = pdfDimensions.height - (normalizedY + height);

    return {
      x: normalizedX,
      y: bottomY,
    };
  }

  /**
   * Converts PDF coordinates (storage) to screen coordinates (display)
   * This function converts from the stored bottom-left to the displayed top-left format
   */
  static convertPdfToScreenCoordinates(
    pdfX: number,
    pdfY: number,
    height: number,
    pdfDimensions: PdfDimensions,
    scale: number
  ) {
    // Calculate screen coordinates
    const screenX = pdfX * scale;

    // pdfY represents distance from bottom of page to bottom of the box
    // We need to convert to distance from top of page to top of the box
    const screenY = (pdfDimensions.height - pdfY - height) * scale;

    return {
      x: screenX,
      y: screenY,
    };
  }

  /**
   * Calculate optimal zoom to fit the container
   */
  static calculateOptimalZoom(
    containerRef: RefObject<HTMLDivElement | null>,
    pdfDimensions: PdfDimensions
  ) {
    if (!containerRef.current || !pdfDimensions.width || !pdfDimensions.height)
      return 1;

    const containerWidth = containerRef.current.clientWidth - 40; // Subtract padding
    const containerHeight = containerRef.current.clientHeight - 40; // Subtract padding

    const widthRatio = containerWidth / pdfDimensions.width;
    const heightRatio = containerHeight / pdfDimensions.height;

    // Use the smaller ratio to ensure both dimensions fit
    return Math.min(widthRatio, heightRatio, 1); // Limit max zoom to 100%
  }
}
