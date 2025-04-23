"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
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
  if (!contact) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const ModalFooter = (
    <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
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
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Contact"
      footer={ModalFooter}
    >
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this contact? This action cannot be
          undone.
        </p>

        <div className="bg-gray-50 p-4 rounded-md">
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
      </div>
    </Modal>
  );
}
