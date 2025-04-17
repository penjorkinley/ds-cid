import React from "react";
import { PDFUtils } from "@/utils/PDFUtils";

interface ResponsiveControlPanelProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  resetZoom: () => void;
  handleAddSignatory: () => void;
  numPages: number | null;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  placeholderCount: number;
}

export const ResponsiveControlPanel: React.FC<ResponsiveControlPanelProps> = ({
  scale,
  setScale,
  resetZoom,
  handleAddSignatory,
  numPages,
  currentPage,
  setCurrentPage,
  placeholderCount,
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
          onClick={handleAddSignatory}
          className="px-3 sm:px-4 py-2 text-white bg-[#5AC893] rounded hover:bg-[#4ba578] transition-colors text-sm sm:text-base flex items-center cursor-pointer"
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
          Add {PDFUtils.getOrdinalSuffix(placeholderCount)} signatory
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
