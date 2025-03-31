import React from "react";
import Input from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";

interface FormData {
  name: string;
  email: string;
  cid: string;
  file: File | null;
}

interface DocumentFormProps {
  formData: FormData;
  error: string | null;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (file: File) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function DocumentForm({
  formData,
  error,
  handleChange,
  handleFileChange,
}: DocumentFormProps) {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

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
            placeholder="Enter Recipient's CID..."
            required
          />
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
        </div>
      </div>
    </div>
  );
}
