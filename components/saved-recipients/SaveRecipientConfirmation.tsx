"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
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
  if (!recipient) return null;

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
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Recipient"
      footer={ModalFooter}
    >
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Would you like to save this recipient to your contacts for future use?
        </p>

        <div className="bg-gray-50 p-4 rounded-md">
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
      </div>
    </Modal>
  );
}
