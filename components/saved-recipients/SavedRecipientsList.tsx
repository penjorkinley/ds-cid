"use client";

import React, { useState } from "react";
import { SavedRecipient, useSavedRecipients } from "./SavedRecipientsContext";
import { Recipient } from "@/components/signature/RecipientStep";

interface SavedRecipientsListProps {
  onSelectRecipient: (recipient: Omit<Recipient, "id">) => void;
}

export default function SavedRecipientsList({
  onSelectRecipient,
}: SavedRecipientsListProps) {
  const { savedRecipients, removeSavedRecipient } = useSavedRecipients();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  // No recipients saved yet
  if (savedRecipients.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 mb-6">
        <div className="flex items-center justify-center h-24 flex-col">
          <p className="text-gray-500 mb-2">No saved contacts yet</p>
          <p className="text-sm text-gray-400">
            Add recipients and save them to your contacts for quick access
          </p>
        </div>
      </div>
    );
  }

  // Filter recipients based on search term
  const filteredRecipients = savedRecipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.idValue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort recipients based on selected sorting method
  const sortedRecipients = [...filteredRecipients].sort((a, b) => {
    if (sortBy === "recent") {
      // Sort by savedAt timestamp (most recent first)
      return b.savedAt - a.savedAt;
    } else {
      // Sort alphabetically by name
      return a.name.localeCompare(b.name);
    }
  });

  // Handle recipient selection
  const handleSelectRecipient = (recipient: SavedRecipient) => {
    // Convert SavedRecipient to Recipient format and pass to parent component
    const selectedRecipient: Omit<Recipient, "id"> = {
      name: recipient.name,
      email: recipient.email,
      idType: recipient.idType,
      idValue: recipient.idValue,
    };

    onSelectRecipient(selectedRecipient);
  };

  return (
    <div className="mb-6">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-auto flex-grow sm:max-w-xs"
        />

        <div className="flex items-center text-sm">
          <span className="text-gray-600 mr-2">Sort by:</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setSortBy("recent")}
              className={`px-3 py-1.5 ${
                sortBy === "recent"
                  ? "bg-[#5AC893] text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`px-3 py-1.5 ${
                sortBy === "name"
                  ? "bg-[#5AC893] text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Name
            </button>
          </div>
        </div>
      </div>

      {/* Recipient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedRecipients.map((recipient) => (
          <div
            key={recipient.id}
            className="border border-gray-200 rounded-lg p-3 hover:border-[#5AC893] hover:shadow-sm transition-all cursor-pointer bg-white"
            onClick={() => handleSelectRecipient(recipient)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{recipient.name}</h4>
                <p className="text-sm text-gray-600">{recipient.email}</p>
                <div className="mt-1 text-xs text-gray-500 flex items-center">
                  <span>{recipient.idType}:</span>
                  <span className="ml-1">{recipient.idValue}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSavedRecipient(recipient.id);
                }}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Remove recipient"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-2 flex items-center text-xs text-gray-400 justify-end">
              <div>Added: {formatDate(recipient.savedAt)}</div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipients.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No matching contacts found</p>
        </div>
      )}
    </div>
  );
}

// Helper function to format date
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
