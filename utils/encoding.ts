import { UploadResponse } from "@/services/ds-api";

export function encodeResponseData(response: UploadResponse): string {
  // Extract only the fields we want to include
  const {
    documentId,
    documentHash,
    documentViewUrl,
    name,
    cid,
    signatureCoordinates, // Changed from signaturePlaceholders to signatureCoordinates
  } = response;

  // Create a new object with only the fields we want
  const dataToEncode = {
    documentId,
    documentHash,
    documentViewUrl,
    name,
    cid,
    signatureCoordinates,
  };

  // Convert to JSON string and then to Base64
  const jsonString = JSON.stringify(dataToEncode);
  return Buffer.from(jsonString).toString("base64");
}
