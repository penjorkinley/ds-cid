import { UploadResponse } from "@/services/ds-api";

export function encodeResponseData(
  response: UploadResponse & { currentRecipientId?: string }
): string {
  // Extract the basic document fields
  const { documentId, documentHash, documentViewUrl } = response;

  // Get the organization ID
  const organizationId = response.orgId;

  // Find the current recipient
  const currentRecipient =
    response.currentRecipient ||
    response.recipients.find((r) => r.id === response.currentRecipientId) ||
    response.recipients[0];

  // Extract signature coordinates from currentRecipient or response
  const signatureCoordinates =
    currentRecipient?.signatureCoordinates || response.signatureCoordinates;

  // Create recipient object with only necessary data
  const recipient = currentRecipient
    ? {
        id: currentRecipient.id,
        name: currentRecipient.name,
        email: currentRecipient.email,
        idType: currentRecipient.idType,
        idValue: currentRecipient.idValue,
        order: currentRecipient.order,
        recipientId: currentRecipient.recipientId,
      }
    : null;

  // Create a new object with only the fields we want
  const dataToEncode = {
    documentId,
    documentHash,
    documentViewUrl,
    organizationId,
    currentRecipientId: currentRecipient?.id,
    signatureCoordinates,
    recipient,
  };

  // For debugging purposes
  console.log("Data being encoded:", dataToEncode);

  // Convert to JSON string and then to Base64
  const jsonString = JSON.stringify(dataToEncode);
  return Buffer.from(jsonString).toString("base64");
}
