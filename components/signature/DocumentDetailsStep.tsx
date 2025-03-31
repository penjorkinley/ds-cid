import React from "react";
import Input from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";
import { z } from "zod";
import { getFieldError } from "@/utils/validation-schemas";

interface FormData {
  name: string;
  email: string;
  cid: string;
  file: File | null;
}

interface DocumentFormProps {
  formData: FormData;
  error: string | null;
  fieldErrors?: z.ZodError | null | undefined;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (file: File) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function DocumentForm({
  formData,
  error,
  fieldErrors,
  handleChange,
  handleFileChange,
}: DocumentFormProps) {
  // Get individual field error messages
  const nameError = getFieldError(fieldErrors, "name");
  const emailError = getFieldError(fieldErrors, "email");
  const cidError = getFieldError(fieldErrors, "cid");
  const fileError = getFieldError(fieldErrors, "file");

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )} */}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Recipient&apos;s Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Recipient's Name..."
            required
          />
          {nameError && (
            <p className="mt-1 text-sm text-red-600">{nameError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Recipient's Email Address..."
            required
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="cid"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CID
          </label>
          <Input
            id="cid"
            name="cid"
            value={formData.cid}
            onChange={handleChange}
            placeholder="Enter Recipient's CID (11 digits)..."
            required
          />
          {cidError && <p className="mt-1 text-sm text-red-600">{cidError}</p>}
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Document
          </label>
          <FileUpload
            onFileSelect={handleFileChange}
            selectedFile={formData.file}
          />
          {fileError && (
            <p className="mt-1 text-sm text-red-600">{fileError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
