import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { UploadResponse } from "@/services/ds-api";
import { encodeResponseData } from "@/utils/encoding";
import { generateQRCode } from "@/utils/qrcode";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { response } = data as { response: UploadResponse };

    if (!response || !response.email) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    const encodedData = encodeResponseData(response);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const qrCodeBuffer = await generateQRCode(encodedData, baseUrl);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: response.email,
      subject: "Your Document QR Code",
      html: `
        <h2>Bhutan NDI Digital Signature Portal</h2>
        <p>Hello ${response.name},</p>
        <p>Your document has been successfully uploaded. Scan the QR code below:</p>
        <img src="cid:qrcode" alt="QR Code" style="display: block; margin: 20px auto; width:250px; height:250px" />
        <p>Thank you for using our service.</p>
      `,
      attachments: [
        {
          filename: "qrcode.png",
          content: qrCodeBuffer,
          cid: "qrcode",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
