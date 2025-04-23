"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import RecipientChip from "@/components/ui/RecipientChip";
import { validateRecipient } from "@/utils/validation-schemas";
import SaveRecipientConfirmation from "@/components/saved-recipients/SaveRecipientConfirmation";
import { useSavedRecipients } from "@/components/saved-recipients/SavedRecipientsContext";

export interface Recipient {
  id: string;
  name: string;
  email: string;
  idType: string;
  idValue: string;
  savedContactId?: string; // Track which saved contact this recipient came from
}

interface RecipientStepProps {
  recipients: Recipient[];
  onRecipientsChange: (recipients: Recipient[]) => void;
}

export default function RecipientStep({
  recipients,
  onRecipientsChange,
}: RecipientStepProps) {
  const { addSavedRecipient, savedRecipients } = useSavedRecipients();
  const [currentRecipient, setCurrentRecipient] = useState<
    Omit<Recipient, "id">
  >({
    name: "",
    email: "",
    idType: "",
    idValue: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(
    null
  );
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [recipientToSave, setRecipientToSave] = useState<Omit<
    Recipient,
    "id"
  > | null>(null);
  // State for update confirmation
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [recipientToUpdate, setRecipientToUpdate] = useState<Recipient | null>(
    null
  );
  // State to store the updated recipients list during the update process
  const [updatedRecipientsList, setUpdatedRecipientsList] = useState<
    Recipient[] | null
  >(null);

  // Clear form or populate it with recipient data for editing
  const resetForm = (recipient?: Recipient) => {
    if (recipient) {
      setCurrentRecipient({
        name: recipient.name,
        email: recipient.email,
        idType: recipient.idType,
        idValue: recipient.idValue,
        savedContactId: recipient.savedContactId,
      });
      setEditingRecipientId(recipient.id);
    } else {
      setCurrentRecipient({
        name: "",
        email: "",
        idType: "",
        idValue: "",
      });
      setEditingRecipientId(null);
    }
    setErrors({});
  };

  // Handle input field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentRecipient((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Check for duplicate recipients in the current form
  const isDuplicate = () => {
    return recipients.some(
      (recipient) =>
        (recipient.email.toLowerCase() ===
          currentRecipient.email.toLowerCase() ||
          recipient.idValue === currentRecipient.idValue) &&
        recipient.id !== editingRecipientId
    );
  };

  // Check if the recipient is already in saved contacts and return the ID if found
  const getSavedContactId = () => {
    const savedContact = savedRecipients.find(
      (contact) =>
        contact.email.toLowerCase() === currentRecipient.email.toLowerCase() ||
        contact.idValue === currentRecipient.idValue
    );
    return savedContact?.id;
  };

  // Add or update recipient
  const handleAddRecipient = () => {
    const validation = validateRecipient(currentRecipient);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (isDuplicate()) {
      setErrors({
        form: "A recipient with this email or ID already exists",
      });
      return;
    }

    if (editingRecipientId) {
      // Find the recipient being edited
      const existingRecipient = recipients.find(
        (r) => r.id === editingRecipientId
      );

      if (!existingRecipient) {
        return;
      }

      // Create updated recipient with the same ID
      const updatedRecipient: Recipient = {
        ...currentRecipient,
        id: editingRecipientId,
        savedContactId: existingRecipient.savedContactId,
      };

      // Update the recipients list
      const updatedRecipients = recipients.map((recipient) =>
        recipient.id === editingRecipientId ? updatedRecipient : recipient
      );

      // Check if this recipient was originally from saved contacts
      if (updatedRecipient.savedContactId) {
        // Check if we've made changes that might need syncing to contacts
        const originalContact = savedRecipients.find(
          (c) => c.id === updatedRecipient.savedContactId
        );

        if (originalContact) {
          // Check each field individually
          const nameChanged = originalContact.name !== updatedRecipient.name;
          const emailChanged = originalContact.email !== updatedRecipient.email;
          const idTypeChanged =
            originalContact.idType !== updatedRecipient.idType;
          const idValueChanged =
            originalContact.idValue !== updatedRecipient.idValue;

          if (nameChanged || emailChanged || idTypeChanged || idValueChanged) {
            // Store the updated recipients list temporarily
            setUpdatedRecipientsList(updatedRecipients);

            // Show confirmation dialog for updating saved contact
            setRecipientToUpdate(updatedRecipient);
            setShowUpdateConfirmation(true);

            // No need to apply form changes yet or reset the form
            // We'll do that after the user decides whether to update the saved contact
            return;
          }
        }
      }

      // If no saved contact to update, just update the form recipients
      onRecipientsChange(updatedRecipients);
    } else {
      // Add new recipient
      const newRecipient: Recipient = {
        ...currentRecipient,
        id: `recipient-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,
      };

      // Check if this matches an existing contact
      const existingContactId = getSavedContactId();
      if (existingContactId) {
        // Link to the existing contact
        newRecipient.savedContactId = existingContactId;
      }

      onRecipientsChange([...recipients, newRecipient]);

      // Only show save confirmation if not already in saved contacts
      if (!existingContactId) {
        setRecipientToSave({
          name: newRecipient.name,
          email: newRecipient.email,
          idType: newRecipient.idType,
          idValue: newRecipient.idValue,
        });
        setShowSaveConfirmation(true);
      }
    }

    // Reset the form after adding/updating
    resetForm();
  };

  // Update saved contact with current recipient data and finalize the form update
  const handleUpdateSavedContact = () => {
    if (recipientToUpdate && recipientToUpdate.savedContactId) {
      // Update the saved contact
      addSavedRecipient({
        name: recipientToUpdate.name,
        email: recipientToUpdate.email,
        idType: recipientToUpdate.idType,
        idValue: recipientToUpdate.idValue,
        id: recipientToUpdate.savedContactId,
      });

      // If we have a stored updated recipients list, apply it now
      if (updatedRecipientsList) {
        onRecipientsChange(updatedRecipientsList);
        setUpdatedRecipientsList(null);
      }
    }

    // Close the modal
    setShowUpdateConfirmation(false);
    setRecipientToUpdate(null);

    // Make sure the form is reset (in case it wasn't already)
    resetForm();
  };

  // Handle declining to update the saved contact
  const handleDeclineUpdate = () => {
    // Still proceed with the form update even if they don't want to update the contact
    if (updatedRecipientsList) {
      onRecipientsChange(updatedRecipientsList);
      setUpdatedRecipientsList(null);
    }

    // Close the modal
    setShowUpdateConfirmation(false);
    setRecipientToUpdate(null);

    // Reset the form
    resetForm();
  };

  // Remove a recipient
  const handleRemoveRecipient = (id: string) => {
    onRecipientsChange(recipients.filter((recipient) => recipient.id !== id));

    // If currently editing this recipient, reset the form
    if (editingRecipientId === id) {
      resetForm();
    }
  };

  // Edit a recipient
  const handleEditRecipient = (id: string) => {
    const recipient = recipients.find((r) => r.id === id);
    if (recipient) {
      resetForm(recipient);
    }
  };

  // Confirm saving a recipient
  const handleConfirmSave = () => {
    if (recipientToSave) {
      // Generate a unique ID for the saved contact
      const savedContactId = `saved-${Date.now()}`;

      // Add to saved contacts
      addSavedRecipient({
        name: recipientToSave.name,
        email: recipientToSave.email,
        idType: recipientToSave.idType,
        idValue: recipientToSave.idValue,
      });

      // Update the recently added recipient to link it to the saved contact
      const recentlyAddedRecipient = recipients.find(
        (r) =>
          r.email.toLowerCase() === recipientToSave.email.toLowerCase() &&
          r.idValue === recipientToSave.idValue
      );

      if (recentlyAddedRecipient) {
        onRecipientsChange(
          recipients.map((r) =>
            r.id === recentlyAddedRecipient.id ? { ...r, savedContactId } : r
          )
        );
      }
    }
    setShowSaveConfirmation(false);
    setRecipientToSave(null);
  };

  // Define ID type options
  const idTypeOptions = [
    { value: "CID No", label: "CID No" },
    { value: "Passport No", label: "Passport No" },
    { value: "EID", label: "EID" },
  ];

  return (
    <div className="space-y-6">
      {/* Display added recipients */}
      {recipients.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          <div className="flex flex-wrap gap-2">
            {recipients.map((recipient) => (
              <RecipientChip
                key={recipient.id}
                id={recipient.id}
                label={recipient.name}
                isActive={editingRecipientId === recipient.id}
                onDelete={handleRemoveRecipient}
                onClick={handleEditRecipient}
                // Add visual indicator for saved contacts
                isSaved={Boolean(recipient.savedContactId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form error */}
      {errors.form && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {errors.form}
        </div>
      )}

      {/* Recipient form */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Recipient&apos;s Name
          </label>
          <Input
            id="name"
            name="name"
            value={currentRecipient.name}
            onChange={handleChange}
            placeholder="Enter Recipient's Name..."
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Recipient&apos;s Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={currentRecipient.email}
            onChange={handleChange}
            placeholder="Enter Recipient's Email Address..."
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="idType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Recipient&apos;s ID Type
          </label>
          <Select
            id="idType"
            name="idType"
            value={currentRecipient.idType}
            onChange={handleChange}
            options={idTypeOptions}
            placeholder="Select"
            required
          />
          {errors.idType && (
            <p className="mt-1 text-sm text-red-600">{errors.idType}</p>
          )}
        </div>

        {currentRecipient.idType && (
          <div>
            <label
              htmlFor="idValue"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Recipient&apos;s {currentRecipient.idType}
            </label>
            <Input
              id="idValue"
              name="idValue"
              value={currentRecipient.idValue}
              onChange={handleChange}
              placeholder={`Enter Recipient's ${currentRecipient.idType}...`}
              required
            />
            {errors.idValue && (
              <p className="mt-1 text-sm text-red-600">{errors.idValue}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <Button
          type="button"
          onClick={handleAddRecipient}
          className="w-auto px-6"
          fullWidth={false}
        >
          {editingRecipientId ? "Update Recipient" : "Add Recipient"}
        </Button>
      </div>

      {/* Save Recipient Confirmation Modal */}
      <SaveRecipientConfirmation
        isOpen={showSaveConfirmation}
        onClose={() => setShowSaveConfirmation(false)}
        recipient={recipientToSave}
        onConfirm={handleConfirmSave}
      />

      {/* Update Saved Contact Confirmation */}
      {showUpdateConfirmation && recipientToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 m-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Saved Contact
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Would you like to update this contact in your saved contacts
                list?
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-5">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Name:
                  </span>
                  <p className="text-gray-800">{recipientToUpdate.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Email:
                  </span>
                  <p className="text-gray-800">{recipientToUpdate.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    ID Type:
                  </span>
                  <p className="text-gray-800">{recipientToUpdate.idType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    ID Value:
                  </span>
                  <p className="text-gray-800">{recipientToUpdate.idValue}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={handleDeclineUpdate}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Don&apos;t Update
              </button>
              <button
                type="button"
                onClick={handleUpdateSavedContact}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#5AC893] border border-transparent rounded-md shadow-sm hover:bg-[#4ba578] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5AC893]"
              >
                Update Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
