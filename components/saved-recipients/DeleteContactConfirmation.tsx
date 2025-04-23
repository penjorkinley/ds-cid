"use client";

import React, { useEffect, useRef } from "react";
import { SavedRecipient } from "./SavedRecipientsContext";

interface DeleteContactConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  contact: SavedRecipient | null;
  onConfirm: () => void;
}

export default function DeleteContactConfirmation({
  isOpen,
  onClose,
  contact,
  onConfirm,
}: DeleteContactConfirmationProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Always define useEffect first, before any conditional returns
  useEffect(() => {
    // Only run the effect logic if the modal is open and we have a contact
    if (!isOpen || !contact) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Handle escape key press
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, contact]); // Include both dependencies

  // Now we can have the conditional return
  if (!isOpen || !contact) return null;

  const handleClose = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 backdrop-blur-[2px]"
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-contact-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 m-4 animate-fade-in"
      >
        <div className="mb-4">
          <h3
            id="delete-contact-title"
            className="text-lg font-semibold text-gray-900"
          >
            Delete Contact
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete this contact? This action cannot be
            undone.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-5">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-gray-800">{contact.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-gray-800">{contact.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">ID:</span>
              <p className="text-gray-800">
                {contact.idType}: {contact.idValue}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
