// utils/qrcode.ts
import QRCode from "qrcode";

export async function generateQRCode(
  data: string,
  baseUrl: string
): Promise<Buffer> {
  try {
    const url = `${baseUrl}/view-document?data=${encodeURIComponent(data)}`;
    return await QRCode.toBuffer(url);
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}
