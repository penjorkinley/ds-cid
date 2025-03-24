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
  isSubmitting,
  handleChange,
  handleFileChange,
  handleSubmit,
}: DocumentFormProps) {
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <Input
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter Recipient's Name..."
        required
      />

      <Input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter Recipient's Email Address..."
        required
      />

      <Input
        id="cid"
        name="cid"
        value={formData.cid}
        onChange={handleChange}
        placeholder="Enter Recipient's CID..."
        required
      />

      <FileUpload
        onFileSelect={handleFileChange}
        selectedFile={formData.file}
      />

      {/* Submit button removed */}
    </div>
  );
}
