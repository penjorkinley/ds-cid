export interface UploadResponse {
  documentId: string;
  documentHash: string;
  documentUrl: string;
  name: string;
  email: string;
  holderDid: string;
  organizationId: string;
  message: string;
}

export interface UploadDocumentParams {
  name: string;
  email: string;
  holderDid: string;
  file: File;
}

export async function uploadDocument(
  params: UploadDocumentParams
): Promise<UploadResponse> {
  const { name, email, holderDid, file } = params;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("holderDid", holderDid);
  formData.append("file", file);

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
