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

export async function generateQRCode(
  data: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
): Promise<Buffer> {
  try {
    const url = `${baseUrl}/api/process-document?data=${encodeURIComponent(
      data
    )}`;
    return await QRCode.toBuffer(url);
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}
