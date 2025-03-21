// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { UploadResponse } from "@/services/ds-api";

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

    // Use the documentViewUrl from the response
    const documentViewUrl =
      response.documentViewUrl ||
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/view-document/${response.documentId}`;

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
      subject: "Your Document Needs Signature",
      html: `
        <h2>Bhutan NDI Digital Signature Portal</h2>
        <p>Hello ${response.name},</p>
        <p>A document has been uploaded that requires your signature. Please click the link below to view and sign the document:</p>
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${documentViewUrl}" 
                 style="display: inline-block; background-color: #5AC893; color: white; 
                        font-weight: bold; padding: 12px 24px; text-decoration: none; 
                        border-radius: 4px; font-family: Arial, sans-serif;">
                View & Sign Document
              </a>
            </td>
          </tr>
        </table>
        
        <p>Document ID: ${response.documentId}</p>
        <p>If you did not expect this document, please disregard this email.</p>
        <p>Thank you for using our service.</p>
      `,
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
