"use client";

import React, { useState, useEffect } from "react";
import { SavedRecipient, useSavedRecipients } from "./SavedRecipientsContext";
import { Recipient } from "@/components/signature/RecipientStep";
import DeleteContactConfirmation from "./DeleteContactConfirmation";
import AlertModal from "@/components/ui/AlertModal";

interface SavedContactsPanelProps {
  onSelectContact: (contact: SavedRecipient) => void;
  currentRecipients?: Recipient[]; // Optional prop to check for duplicates
}

export default function SavedContactsPanel({
  onSelectContact,
  currentRecipients = [],
}: SavedContactsPanelProps) {
  const { savedRecipients, removeSavedRecipient } = useSavedRecipients();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // States for delete confirmation modal
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<SavedRecipient | null>(
    null
  );

  // Add state for AlertModal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Implement debounce for search to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Filter saved recipients based on search term
  const filteredRecipients = savedRecipients.filter(
    (recipient) =>
      recipient.name
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      recipient.email
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      recipient.idValue
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase())
  );

  // Show most recently added/updated contacts first
  const sortedRecipients = [...filteredRecipients].sort(
    (a, b) => b.savedAt - a.savedAt
  );

  // Handle when delete button is clicked - show confirmation modal
  const handleDeleteContact = (
    contact: SavedRecipient,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setContactToDelete(contact);
    setShowDeleteConfirmation(true);
  };

  // Handle confirm delete action
  const confirmDeleteContact = () => {
    if (contactToDelete) {
      removeSavedRecipient(contactToDelete.id);
    }
  };

  // Check if a contact is already in the recipients list - EXACT MATCH VERSION
  const isContactAlreadyAdded = (contact: SavedRecipient) => {
    return currentRecipients.some((recipient) => {
      // A contact is only considered "already added" if ALL details match exactly
      return (
        recipient.name === contact.name &&
        recipient.email.toLowerCase() === contact.email.toLowerCase() &&
        recipient.idType === contact.idType &&
        recipient.idValue === contact.idValue
      );
    });
  };

  // Handle contact selection with duplicate check
  const handleContactSelect = (contact: SavedRecipient) => {
    // Check if the email or CID is already in use in the current recipients
    const emailExists = currentRecipients.some(
      (r) => r.email.toLowerCase() === contact.email.toLowerCase()
    );

    const cidExists = currentRecipients.some(
      (r) => r.idValue === contact.idValue
    );

    if (emailExists || cidExists) {
      // Provide a more specific message
      let message = "";
      if (emailExists && cidExists) {
        message = `A recipient with the same email (${contact.email}) and ${contact.idType} (${contact.idValue}) already exists.`;
      } else if (emailExists) {
        message = `A recipient with the email ${contact.email} already exists.`;
      } else {
        message = `A recipient with the ${contact.idType} ${contact.idValue} already exists.`;
      }

      setAlertMessage(message);
      setShowAlertModal(true);
      return;
    }

    // Otherwise, it's safe to add
    onSelectContact(contact);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-full max-h-[calc(100vh-120px)]">
      {/* Header with title - keep this outside the scrollable area */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-base font-medium text-gray-700">Saved Contacts</h3>
        <div className="text-sm text-gray-500">
          {savedRecipients.length}{" "}
          {savedRecipients.length === 1 ? "contact" : "contacts"}
        </div>
      </div>

      {/* Search input with improved placeholder */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5AC893]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-4 w-4"
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
          )}
        </div>
      </div>

      {/* Contacts list container - now fully scrollable */}
      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
        {savedRecipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-500">No saved contacts yet</p>
            <p className="text-sm text-gray-400 mt-1 text-center">
              Add recipients and save them to your contacts for quick access
            </p>
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">No matching contacts found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {sortedRecipients.map((recipient: SavedRecipient) => {
                const isAlreadyAdded = isContactAlreadyAdded(recipient);
                const lastUpdateDate = new Date(
                  recipient.savedAt
                ).toLocaleDateString();

                return (
                  <div
                    key={recipient.id}
                    onClick={() =>
                      !isAlreadyAdded && handleContactSelect(recipient)
                    }
                    className={`rounded-lg border p-4 transition relative ${
                      isAlreadyAdded
                        ? "border-green-200 bg-green-50 cursor-default"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                    }`}
                  >
                    {/* Delete button at top right */}
                    <button
                      onClick={(e) => handleDeleteContact(recipient, e)}
                      className="absolute right-2 top-2 text-gray-400 hover:text-red-500 p-1"
                      aria-label="Remove contact"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>

                    <div className="flex flex-col">
                      <h4 className="font-medium text-gray-900 truncate pr-6">
                        {recipient.name}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {recipient.email}
                      </p>
                      <div className="mt-1 text-xs text-gray-500">
                        <span>
                          {recipient.idType}: {recipient.idValue}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Updated: {lastUpdateDate}
                      </div>
                    </div>

                    {/* "Already added" badge positioned at bottom right */}
                    {isAlreadyAdded && (
                      <div className="absolute bottom-2 right-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Already added
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteContactConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        contact={contactToDelete}
        onConfirm={confirmDeleteContact}
      />

      {/* Add Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Duplicate Information"
        message={alertMessage}
        variant="warning"
      />
    </div>
  );
}
