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

  const response = await fetch(
    "https://e40c-202-144-128-70.ngrok-free.app/documents/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upload failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}
