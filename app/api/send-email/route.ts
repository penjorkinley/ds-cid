import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { UploadResponse } from "@/services/ds-api";
import { encodeResponseData } from "@/utils/encoding";
import { generateQRCode } from "@/utils/qrcode";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { response } = data as { response: UploadResponse };

    if (!response || !response.recipients || response.recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get the current recipient to send the email to
    // If currentRecipient is provided, use it; otherwise, use the first recipient by order
    const orderedRecipients = [...response.recipients].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    const currentRecipient = response.currentRecipient || orderedRecipients[0];

    if (!currentRecipient || !currentRecipient.email) {
      return NextResponse.json(
        { success: false, message: "No valid recipient found" },
        { status: 400 }
      );
    }

    // Create recipient-specific encoded data
    const encodedData = encodeResponseData({
      ...response,
      currentRecipientId: currentRecipient.id,
    });

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

    // Get recipient order for display, defaulting to 1 if undefined
    const recipientOrder = currentRecipient.order || 1;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: currentRecipient.email,
      subject: "Your Document for Digital Signature",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .qrcode { text-align: center; margin: 30px 0; }
            .qrcode img { border: 1px solid #ddd; border-radius: 4px; padding: 5px; }
            .credential-box { background-color: #f1f1f1; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .credential-card { display: flex; align-items: center; background-color: #fff; padding: 10px 15px; border-radius: 4px; }
            .credential-icon { margin-right: 15px; }
            .steps { margin-top: 20px; }
            .steps ol { padding-left: 25px; }
            .footer { margin-top: 30px; text-align: center; font-size: 14px; color: #666; }
            .info-icon { color: #555; font-size: 18px; margin-right: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Bhutan NDI Digital Signature Portal</h2>
            </div>
            
            <p>Hello ${currentRecipient.name},</p>
            
            <p>A document has been shared with you for digital signature. Please scan the QR code below to view the document and apply your digital signature.</p>
            
             <!-- Add signing order information -->
            <p style="text-align: center; font-weight: bold; color: #333;">
              You are signatory #${recipientOrder} of ${response.recipients.length}
            </p>
            
            <div class="credential-box">
              <p style="text-align: center; color: #555; font-weight: 500;">
                Please ensure that you have the following self-attested credential in your Bhutan NDI Wallet:
              </p>
              <p style="font-weight: 700; color: #444;">
                E-SIGNATURE
              </p>
              
              <div class="steps">
                <p><span class="info-icon">ℹ️</span> If you do not have one, complete the following:</p>
                <ol>
                  <li>Open Bhutan NDI Wallet</li>
                  <li>Click the "More" button in the bottom menu bar</li>
                  <li>Go to "Self Attested Credentials"</li>
                  <li>Select "E-Signature" from the dropdown menu and fill out the fields</li>
                  <li>Click "Save" to receive your self-attested E-Signature</li>
                </ol>
              </div>
            </div>
            <div class="qrcode">
              <img src="cid:qrcode" alt="QR Code" style="width:250px; height:250px">
            </div>
            
            <p>After scanning the QR code, you will be directed to the signature page where you can review the document and apply your digital signature.</p>
            
            <div class="footer">
              <p>Thank you for using the Bhutan NDI Digital Signature Portal.</p>
            </div>
          </div>
        </body>
        </html>
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
