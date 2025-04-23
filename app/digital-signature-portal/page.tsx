"use client";

import SignatureForm from "@/components/signature/SignatureForm";
import SavedContactsPanel from "@/components/saved-recipients/SavedContactsPanel";
import { useState, useEffect } from "react";
import { SavedRecipient } from "@/components/saved-recipients/SavedRecipientsContext";
import { Recipient } from "@/components/signature/RecipientStep";

export default function DigitalSignaturePage() {
  // State to track the currently selected contact (to be passed to the signature form)
  const [selectedContact, setSelectedContact] = useState<SavedRecipient | null>(
    null
  );

  // State to track current recipients in the form (to pass to the contacts panel)
  const [currentRecipients, setCurrentRecipients] = useState<Recipient[]>([]);

  // Handle when a contact is selected from the saved contacts panel
  const handleContactSelect = (contact: SavedRecipient) => {
    setSelectedContact(contact);
  };

  // Clear the selected contact after it's been used
  const handleContactUsed = () => {
    setSelectedContact(null);
  };

  // Handle when recipients change in the form
  const handleRecipientsChange = (recipients: Recipient[]) => {
    setCurrentRecipients(recipients);
  };

  return (
    <main className="flex flex-col items-center pt-8 sm:pt-12 md:pt-16 px-4 pb-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Signature Form */}
          <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200">
            <SignatureForm
              selectedContact={selectedContact}
              onContactUsed={handleContactUsed}
              onRecipientsChange={handleRecipientsChange}
            />
          </div>

          {/* Right column - Saved Contacts Panel */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col">
            <SavedContactsPanel
              onSelectContact={handleContactSelect}
              currentRecipients={currentRecipients}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
