"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import RecipientChip from "@/components/ui/RecipientChip";
import { validateRecipient } from "@/utils/validation-schemas";

export interface Recipient {
  id: string;
  name: string;
  email: string;
  idType: string;
  idValue: string;
}

interface RecipientStepProps {
  recipients: Recipient[];
  onRecipientsChange: (recipients: Recipient[]) => void;
}

export default function RecipientStep({
  recipients,
  onRecipientsChange,
}: RecipientStepProps) {
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

  // Clear form or populate it with recipient data for editing
  const resetForm = (recipient?: Recipient) => {
    if (recipient) {
      setCurrentRecipient({
        name: recipient.name,
        email: recipient.email,
        idType: recipient.idType,
        idValue: recipient.idValue,
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

  // Check for duplicate recipients
  const isDuplicate = () => {
    return recipients.some(
      (recipient) =>
        (recipient.email.toLowerCase() ===
          currentRecipient.email.toLowerCase() ||
          recipient.idValue === currentRecipient.idValue) &&
        recipient.id !== editingRecipientId
    );
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
      // Update existing recipient
      const updatedRecipients = recipients.map((recipient) =>
        recipient.id === editingRecipientId
          ? { ...currentRecipient, id: editingRecipientId }
          : recipient
      );
      onRecipientsChange(updatedRecipients);
    } else {
      // Add new recipient
      const newRecipient: Recipient = {
        ...currentRecipient,
        id: Date.now().toString(), // Simple ID generation
      };
      onRecipientsChange([...recipients, newRecipient]);
    }

    // Reset the form after adding/updating
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

  // Define ID type options
  const idTypeOptions = [
    { value: "CID No", label: "CID No" },
    { value: "Passport No", label: "Passport No" },
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
            Recipient's Name
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
            Recipient's Email Address
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
            Recipient's ID Type
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
              Enter Recipient's {currentRecipient.idType}
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
    </div>
  );
}
