"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Recipient } from "@/components/signature/RecipientStep";

// Interface for our saved recipient (extends the basic recipient)
export interface SavedRecipient extends Omit<Recipient, "id"> {
  id: string;
  savedAt: number; // Timestamp when the recipient was saved
}

interface SavedRecipientsContextType {
  savedRecipients: SavedRecipient[];
  addSavedRecipient: (
    recipient: Omit<Recipient, "id"> & { id?: string }
  ) => void;
  removeSavedRecipient: (id: string) => void;
  clearAllSavedRecipients: () => void;
}

const SavedRecipientsContext = createContext<
  SavedRecipientsContextType | undefined
>(undefined);

interface SavedRecipientsProviderProps {
  children: ReactNode;
}

export const SavedRecipientsProvider: React.FC<
  SavedRecipientsProviderProps
> = ({ children }) => {
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);

  // Load saved recipients from localStorage on component mount
  useEffect(() => {
    const loadSavedRecipients = () => {
      try {
        const savedRecipientsJSON = localStorage.getItem("savedRecipients");
        if (savedRecipientsJSON) {
          const parsedRecipients = JSON.parse(savedRecipientsJSON);
          setSavedRecipients(parsedRecipients);
        }
      } catch (error) {
        // If there's an error, reset to empty array
        setSavedRecipients([]);
      }
    };

    loadSavedRecipients();
  }, []);

  // Save to localStorage whenever savedRecipients changes
  useEffect(() => {
    if (savedRecipients.length > 0) {
      localStorage.setItem("savedRecipients", JSON.stringify(savedRecipients));
    } else {
      // Clear if we have no saved recipients
      localStorage.removeItem("savedRecipients");
    }
  }, [savedRecipients]);

  // Add a new saved recipient or update an existing one
  const addSavedRecipient = (
    recipient: Omit<Recipient, "id"> & { id?: string }
  ) => {
    // Validate required fields
    if (
      !recipient.name ||
      !recipient.email ||
      !recipient.idType ||
      !recipient.idValue
    ) {
      return; // Don't save invalid recipients
    }

    // Handle the case where we are updating an existing saved contact
    if (recipient.id) {
      // Check if the contact with this ID actually exists
      const existingContact = savedRecipients.find(
        (c) => c.id === recipient.id
      );

      if (existingContact) {
        // Direct update using provided ID
        setSavedRecipients((prev) =>
          prev.map((saved) =>
            saved.id === recipient.id
              ? {
                  ...saved,
                  name: recipient.name,
                  email: recipient.email,
                  idType: recipient.idType,
                  idValue: recipient.idValue,
                  savedAt: Date.now(), // Update the timestamp
                }
              : saved
          )
        );
      } else {
        // ID doesn't exist, create new
        const newSavedRecipient: SavedRecipient = {
          name: recipient.name,
          email: recipient.email,
          idType: recipient.idType,
          idValue: recipient.idValue,
          id: `saved-${Date.now()}`, // Generate new ID instead
          savedAt: Date.now(),
        };
        setSavedRecipients((prev) => [...prev, newSavedRecipient]);
      }
      return;
    }

    // Check if recipient with same email or ID already exists
    const existingRecipient = savedRecipients.find(
      (saved) =>
        saved.email.toLowerCase() === recipient.email.toLowerCase() ||
        saved.idValue === recipient.idValue
    );

    if (existingRecipient) {
      // Update existing recipient
      setSavedRecipients((prev) =>
        prev.map((saved) =>
          saved.id === existingRecipient.id
            ? {
                ...saved,
                name: recipient.name,
                email: recipient.email,
                idType: recipient.idType,
                idValue: recipient.idValue,
                savedAt: Date.now(), // Update the timestamp
              }
            : saved
        )
      );
    } else {
      // Add new recipient with generated ID
      const newId = `saved-${Date.now()}`;
      const newSavedRecipient: SavedRecipient = {
        name: recipient.name,
        email: recipient.email,
        idType: recipient.idType,
        idValue: recipient.idValue,
        id: newId,
        savedAt: Date.now(),
      };

      setSavedRecipients((prev) => [...prev, newSavedRecipient]);
    }
  };

  // Remove a saved recipient
  const removeSavedRecipient = (id: string) => {
    setSavedRecipients((prev) =>
      prev.filter((recipient) => recipient.id !== id)
    );
  };

  // Clear all saved recipients
  const clearAllSavedRecipients = () => {
    setSavedRecipients([]);
    localStorage.removeItem("savedRecipients");
  };

  return (
    <SavedRecipientsContext.Provider
      value={{
        savedRecipients,
        addSavedRecipient,
        removeSavedRecipient,
        clearAllSavedRecipients,
      }}
    >
      {children}
    </SavedRecipientsContext.Provider>
  );
};

export const useSavedRecipients = () => {
  const context = useContext(SavedRecipientsContext);
  if (context === undefined) {
    throw new Error(
      "useSavedRecipients must be used within a SavedRecipientsProvider"
    );
  }
  return context;
};
