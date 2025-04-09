export interface SignaturePlaceholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  recipientId?: string;
  order?: number;
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  cid: string;
}

export interface UploadResponse {
  documentId: string;
  documentHash: string;
  documentViewUrl: string;
  recipients: Recipient[]; // Changed to array of recipients
  organizationId?: string;
  message: string;
  signaturePlaceholders?: SignaturePlaceholder[];
  signatureCoordinates?: string;
}

export interface UploadDocumentParams {
  recipients: Recipient[]; // Changed to array of recipients
  file: File;
  signaturePlaceholders?: SignaturePlaceholder[];
}

export async function uploadDocument(
  params: UploadDocumentParams
): Promise<UploadResponse> {
  const { recipients, file, signaturePlaceholders } = params;

  const formData = new FormData();

  // Add recipients as JSON string
  formData.append("recipients", JSON.stringify(recipients));

  // Add file
  formData.append("file", file);

  // Add signature placeholders if available
  if (signaturePlaceholders && signaturePlaceholders.length > 0) {
    // Clean signaturePlaceholders to remove unwanted properties
    const cleanedPlaceholders = signaturePlaceholders.map(
      ({ id, x, y, width, height, pageNumber, recipientId, order }) => ({
        id,
        x,
        y,
        width,
        height,
        pageNumber,
        recipientId,
        order,
      })
    );

    formData.append(
      "signaturePlaceholders",
      JSON.stringify(cleanedPlaceholders)
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

// // Backward compatibility function for single recipient use case
// export async function uploadDocumentSingleRecipient(params: {
//   name: string;
//   email: string;
//   cid: string;
//   file: File;
//   signaturePlaceholders?: SignaturePlaceholder[];
// }): Promise<UploadResponse> {
//   const { name, email, cid, file, signaturePlaceholders } = params;

//   // Convert single recipient format to multi-recipient format
//   const recipient: Recipient = {
//     id: Date.now().toString(), // Generate a simple ID
//     name,
//     email,
//     cid,
//   };

//   // Update placeholders to include recipient ID if not already present
//   const updatedPlaceholders = signaturePlaceholders?.map((placeholder) => ({
//     ...placeholder,
//     recipientId: placeholder.recipientId || recipient.id,
//     order: placeholder.order || 1,
//   }));

//   // Use the new multi-recipient function
//   return uploadDocument({
//     recipients: [recipient],
//     file,
//     signaturePlaceholders: updatedPlaceholders,
//   });
// }
