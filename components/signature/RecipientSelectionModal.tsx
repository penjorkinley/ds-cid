"use client";
import { useState } from "react";
import React, { useEffect, useRef } from "react";
import { Recipient } from "@/components/signature/RecipientStep";

interface RecipientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Recipient[];
  onSelectRecipient: (recipient: Recipient) => void;
  alreadyAssignedIds: string[];
  placeholderCount: number;
}

export default function RecipientSelectionModal({
  isOpen,
  onClose,
  recipients,
  onSelectRecipient,
  alreadyAssignedIds,
  placeholderCount,
}: RecipientSelectionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [_hasScroll, setHasScroll] = useState(false);

  // Check if content needs scrollbar
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const checkForScroll = () => {
        if (contentRef.current) {
          setHasScroll(
            contentRef.current.scrollHeight > contentRef.current.clientHeight
          );
        }
      };

      checkForScroll();
      window.addEventListener("resize", checkForScroll);

      return () => {
        window.removeEventListener("resize", checkForScroll);
      };
    }
  }, [isOpen, recipients]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 backdrop-blur-[2px]">
      {" "}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col"
        style={{ maxHeight: "min(600px, 80vh)" }}
      >
        {/* Modal Header - Fixed position */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Choose the {getOrdinalSuffix(placeholderCount)} signatory
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body - Scrollable area */}
        <div
          ref={contentRef}
          className="overflow-y-auto flex-grow p-5 custom-scrollbar"
          style={{
            overflowY: "auto",
            maxHeight: "calc(80vh - 130px)", // Adjust based on header/footer height
          }}
        >
          {recipients.length === 0 ? (
            <p className="text-gray-500 text-center">
              No recipients added yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {recipients.map((recipient) => {
                const isAssigned = alreadyAssignedIds.includes(recipient.id);

                return (
                  <li key={recipient.id}>
                    <button
                      type="button"
                      onClick={() => onSelectRecipient(recipient)}
                      disabled={isAssigned}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        isAssigned
                          ? "border-green-200 bg-green-50 cursor-default"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{recipient.name}</h4>
                          <p className="text-sm text-gray-600">
                            {recipient.email}
                          </p>
                        </div>
                        {isAssigned && (
                          <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            Already added
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return num + "st";
  }
  if (j === 2 && k !== 12) {
    return num + "nd";
  }
  if (j === 3 && k !== 13) {
    return num + "rd";
  }
  return num + "th";
}
