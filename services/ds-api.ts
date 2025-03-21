// services/ds-api.ts
export interface UploadResponse {
  documentId: string;
  documentHash: string;
  documentUrl: string;
  documentViewUrl: string; // Added this new field
  name: string;
  email: string;
  cid: string;
  organizationId: string;
  signatureCoordinates: string; // Added this new field
  message: string;
}

export interface UploadDocumentParams {
  name: string;
  email: string;
  cid: string;
  file: File;
  signatureCoordinates?: string;
}

export async function uploadDocument(
  params: UploadDocumentParams
): Promise<UploadResponse> {
  const { name, email, cid, file, signatureCoordinates } = params;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("cid", cid);
  formData.append("file", file);

  // Add signature coordinates if provided
  if (signatureCoordinates) {
    formData.append("signatureCoordinates", signatureCoordinates);
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
