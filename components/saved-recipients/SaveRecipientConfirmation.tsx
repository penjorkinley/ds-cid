"use client";

import React, { useEffect } from "react";
import { Recipient } from "@/components/signature/RecipientStep";

interface SaveRecipientConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: Omit<Recipient, "id"> | null;
  onConfirm: () => void;
}

export default function SaveRecipientConfirmation({
  isOpen,
  onClose,
  recipient,
  onConfirm,
}: SaveRecipientConfirmationProps) {
  // IMPORTANT: All hooks must be called before any conditional returns
  useEffect(() => {
    // Only apply scroll locking if modal is open
    if (!isOpen) return;

    // Store the original overflow style to restore it exactly as it was
    const originalOverflow = document.body.style.overflow;

    // Lock scrolling
    document.body.style.overflow = "hidden";

    // Ensure we clean up properly even if component unmounts unexpectedly
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]); // Re-run when isOpen changes

  // After all hooks, we can have conditional returns
  if (!isOpen || !recipient) return null;

  // Ensure body can scroll again when modal closes via buttons
  const handleClose = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 m-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Save Recipient
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Would you like to save this recipient to your contacts for future
            use?
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-5">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-gray-800">{recipient.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-gray-800">{recipient.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                ID Type:
              </span>
              <p className="text-gray-800">{recipient.idType}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                ID Value:
              </span>
              <p className="text-gray-800">{recipient.idValue}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Don&apos;t Save
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#5AC893] border border-transparent rounded-md shadow-sm hover:bg-[#4ba578] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5AC893]"
          >
            Save to Contacts
          </button>
        </div>
      </div>
    </div>
  );
}
