import { UploadResponse } from "@/services/ds-api";

export function encodeResponseData(
  response: UploadResponse & { currentRecipientId?: string }
): string {
  // Extract the fields we want to include
  const {
    documentId,
    documentHash,
    documentViewUrl,
    currentRecipientId,
    signatureCoordinates,
  } = response;

  const currentRecipient =
    response.currentRecipient ||
    response.recipients.find((r) => r.id === currentRecipientId) ||
    response.recipients[0];

  // Create a new object with only the fields we want
  const dataToEncode = {
    documentId,
    documentHash,
    documentViewUrl,
    currentRecipientId,
    signatureCoordinates,
    // Include only the current recipient's information
    recipient: currentRecipient
      ? {
          id: currentRecipient.id,
          name: currentRecipient.name,
          email: currentRecipient.email,
          cid: currentRecipient.cid,
          order: currentRecipient.order,
        }
      : null,
  };

  // Convert to JSON string and then to Base64
  const jsonString = JSON.stringify(dataToEncode);
  return Buffer.from(jsonString).toString("base64");
}
