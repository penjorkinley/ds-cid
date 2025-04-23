"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
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

  // Handle recipient selection
  const handleSelectRecipient = (recipient: Recipient) => {
    onSelectRecipient(recipient);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Choose the ${getOrdinalSuffix(placeholderCount)} signatory`}
      size="md"
    >
      {recipients.length === 0 ? (
        <p className="text-gray-500 text-center">No recipients added yet.</p>
      ) : (
        <ul className="space-y-2">
          {recipients.map((recipient) => {
            const isAssigned = alreadyAssignedIds.includes(recipient.id);

            return (
              <li key={recipient.id}>
                <button
                  type="button"
                  onClick={() => handleSelectRecipient(recipient)}
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
                      <p className="text-sm text-gray-600">{recipient.email}</p>
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
    </Modal>
  );
}
