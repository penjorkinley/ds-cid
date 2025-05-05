import QRCode from "qrcode";

// export async function generateQRCode(
//   data: string,
//   baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
// ): Promise<Buffer> {
//   try {
//     const url = `${baseUrl}/view-document?data=${encodeURIComponent(data)}`;
//     return await QRCode.toBuffer(url);
//   } catch (error) {
//     console.error("Error generating QR code:", error);
//     throw new Error("Failed to generate QR code");
//   }
// }

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
    const deepLinkUrl = `${deepLinkBaseUrl}${encodeURIComponent(data)}`;

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
