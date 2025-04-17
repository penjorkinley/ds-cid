import React from "react";
import { Rnd } from "react-rnd";
import { SignaturePlaceholder } from "@/components/signature/PDFSignaturePlacement";
import { PDFUtils } from "@/utils/PDFUtils";

interface SignaturePlaceholderItemProps {
  placeholder: SignaturePlaceholder;
  displayX: number;
  displayY: number;
  displayWidth: number;
  displayHeight: number;
  isTouchDevice: boolean;
  onDragStart: () => void;
  onDrag: () => void;
  onDragStop: (x: number, y: number) => void;
  onResizeStop: (width: number, height: number, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

export const SignaturePlaceholderItem: React.FC<
  SignaturePlaceholderItemProps
> = ({
  placeholder,
  displayX,
  displayY,
  displayWidth,
  displayHeight,
  isTouchDevice,
  onDragStart,
  onDrag,
  onDragStop,
  onResizeStop,
  onRemove,
}) => {
  const colorStyles = PDFUtils.getPlaceholderColor(placeholder.order);

  return (
    <Rnd
      key={placeholder.id}
      position={{ x: displayX, y: displayY }}
      size={{ width: displayWidth, height: displayHeight }}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragStop={(e, d) => onDragStop(d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResizeStop(
          parseInt(ref.style.width),
          parseInt(ref.style.height),
          position.x,
          position.y
        );
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
      <div
        className={`relative w-full h-full border-2 border-dashed flex items-center justify-center signature-drag-handle
          ${colorStyles.border} ${colorStyles.bg} bg-opacity-50`}
      >
        <div className="flex flex-col items-center justify-center">
          <span
            className={`text-xs sm:text-sm font-medium pointer-events-none ${colorStyles.text}`}
          >
            {placeholder.recipientName}
          </span>
          <span className="text-xs text-gray-600 mt-1 pointer-events-none">
            Signatory #{placeholder.order}
          </span>
        </div>

        {/* Delete button */}
        <div
          className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-50 touch-manipulation"
          onTouchEnd={(e) => {
            e.stopPropagation();
            onRemove(placeholder.id);
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
              onRemove(placeholder.id);
            }}
            aria-label="Remove signature field"
          >
            <span className="text-xl font-bold">×</span>
          </button>
        </div>
      </div>
    </Rnd>
  );
};
