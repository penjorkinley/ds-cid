import { UploadResponse } from "@/services/ds-api";

export function encodeResponseData(response: UploadResponse): string {
  // Extract all fields except email and message
  const { email, message, ...dataToEncode } = response;

  // Convert to JSON string and then to Base64
  const jsonString = JSON.stringify(dataToEncode);
  return Buffer.from(jsonString).toString("base64");
}
