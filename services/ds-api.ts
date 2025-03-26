export interface SignaturePlaceholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface UploadResponse {
  documentId: string;
  documentHash: string;
  documentViewUrl: string;
  name: string;
  email: string;
  cid: string;
  organizationId: string;
  message: string;
  signaturePlaceholders?: SignaturePlaceholder[];
}

export interface UploadDocumentParams {
  name: string;
  email: string;
  cid: string;
  file: File;
  signaturePlaceholders?: SignaturePlaceholder[];
}

export async function uploadDocument(
  params: UploadDocumentParams
): Promise<UploadResponse> {
  const { name, email, cid, file, signaturePlaceholders } = params;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("cid", cid);
  formData.append("file", file);

  // Add signature placeholders if available
  if (signaturePlaceholders && signaturePlaceholders.length > 0) {
    formData.append(
      "signaturePlaceholders",
      JSON.stringify(signaturePlaceholders)
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upload failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}
