import QRCode from "qrcode";

export interface QRCodeResult {
  buffer: Buffer;
  apiUrl: string;
  deepLinkUrl: string;
}

export async function generateQRCode(
  data: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
): Promise<QRCodeResult> {
  try {
    // Create the API URL for QR code
    const apiUrl = `${baseUrl}/api/process-document?data=${encodeURIComponent(
      data
    )}`;

    // Generate QR code for the API URL
    const buffer = await QRCode.toBuffer(apiUrl);

    // Create the deep link URL
    const deepLinkBaseUrl =
      process.env.DEEPLINK_BASE_URL || "https://bhutanndi.app.link/?t=";
    const deepLinkUrl = `${deepLinkBaseUrl}${encodeURIComponent(apiUrl)}`;

    return {
      buffer,
      apiUrl,
      deepLinkUrl,
    };
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}
