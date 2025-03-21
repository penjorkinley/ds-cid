// components/DocumentForm.tsx
import React, { useState } from "react";
import Input from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";
import Button from "@/components/ui/Button";
import DocumentEditor from "@/components/DocumentEditor";

interface FormData {
  name: string;
  email: string;
  cid: string;
  file: File | null;
  signatureCoordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface DocumentFormProps {
  formData: FormData;
  error: string | null;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (file: File) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setSignatureCoordinates: (coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

export default function DocumentForm({
  formData,
  error,
  isSubmitting,
  handleChange,
  handleFileChange,
  handleSubmit,
  setSignatureCoordinates,
}: DocumentFormProps) {
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Document Viewer

  const handlePlaceholderSet = (coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    setSignatureCoordinates(coordinates);
  };

  const goToDocumentViewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.file) {
      setShowDocumentViewer(true);
    }
  };

  if (showDocumentViewer) {
    return (
      <>
        <DocumentEditor
          file={formData.file!}
          onPlaceholderSet={handlePlaceholderSet}
          onClose={() => setShowDocumentViewer(false)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </>
    );
  }

  return (
    <form onSubmit={goToDocumentViewer} className="space-y-6">
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
        accept=".pdf"
      />

      <Button type="submit">Next</Button>
    </form>
  );
}
