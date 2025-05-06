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

    // Generate QR code and get URLs
    const { buffer: qrCodeBuffer, deepLinkUrl } = await generateQRCode(
      encodedData,
      baseUrl
    );

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
    const totalRecipients = response.recipients.length;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: currentRecipient.email,
      subject: "Your Document for Digital Signature",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Base styles */
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            
            /* Signatory badge */
            .signatory-badge {
              background-color: #e9f5f1;
              color: #2a7a5d;
              padding: 8px 16px;
              border-radius: 50px;
              display: inline-block;
              font-weight: 600;
              font-size: 14px;
              margin: 15px 0;
            }
            
            /* Credential box */
            .credential-box {
              background-color: #f8f9fa;
              border-left: 4px solid #5AC893;
              padding: 20px;
              border-radius: 8px;
              margin: 25px auto;
              width: 100%;
              max-width: 500px;
            }
            .credential-box h3 {
              color: #2a7a5d;
              margin-top: 0;
              margin-bottom: 15px;
              font-size: 16px;
            }
            .credential-name {
              background-color: white;
              padding: 12px;
              border-radius: 6px;
              text-align: center;
              margin: 15px 0;
              border: 1px solid #e0e0e0;
              font-weight: 700;
              color: #333;
              font-size: 16px;
            }
            
            /* Steps */
            .steps {
              margin-top: 20px;
            }
            .steps ol {
              padding-left: 25px;
              margin-bottom: 0;
            }
            .steps li {
              margin-bottom: 8px;
            }
            
            /* Sign options title */
            .sign-options-title {
              text-align: center;
              font-size: 18px;
              margin: 30px 0 20px;
              color: #333;
            }
            
            /* Options container */
            .options-container {
              width: 100%;
              display: block;
              margin: 0 auto;
            }
            
            /* Option cards */
            .option-card {
              background-color: white;
              border-radius: 8px;
              border: 1px solid #e0e0e0;
              padding: 20px;
              text-align: center;
              margin: 15px auto;
              width: 100%;
              max-width: 500px;
              box-sizing: border-box;
            }
            
            /* Option label */
            .option-label {
              color: #5AC893;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              display: block;
            }
            
            /* Button */
            .button {
              display: inline-block;
              background-color: #5AC893;
              color: #FFFFFF !important;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 14px;
              margin-top: 20px;
            }
            
            /* QR code */
            .qrcode {
              margin: 20px auto;
              max-width: 180px;
            }
            .qrcode img {
              width: 100%;
              height: auto;
            }
            
            /* Divider */
            .or-divider {
              text-align: center;
              margin: 25px auto;
              position: relative;
            }
            .or-divider::before, .or-divider::after {
              content: "";
              position: absolute;
              top: 50%;
              width: 45%;
              height: 1px;
              background-color: #cccccc;
            }
            .or-divider::before {
              left: 0;
            }
            .or-divider::after {
              right: 0;
            }
            .or-text {
              display: inline-block;
              padding: 0 10px;
              background-color: #ffffff;
              position: relative;
              color: #888888;
              font-size: 14px;
            }
            
            /* Footer text */
            .footer-text {
              text-align: center;
              margin-top: 30px;
              color: #666666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <p>Hello ${currentRecipient.name},</p>
            
            <p>A document has been shared with you for digital signature. Please review and sign it using one of the methods below.</p>
            
            <div style="text-align: center;">
              <div class="signatory-badge">
                You are signatory #${recipientOrder} of ${totalRecipients}
              </div>
            </div>
            
            <div class="credential-box">
              <h3>Required Credential</h3>
              <p>Please ensure you have the following self-attested credential in your Bhutan NDI Wallet:</p>
              
              <div class="credential-name">E-SIGNATURE</div>
              
              <div class="steps">
                <p>If you don't have one, complete these steps:</p>
                <ol>
                  <li>Open Bhutan NDI Wallet</li>
                  <li>Click the "More" button in the bottom menu bar</li>
                  <li>Go to "Self Attested Credentials"</li>
                  <li>Select "E-Signature" from the dropdown menu and fill out the fields</li>
                  <li>Click "Save" to receive your self-attested E-Signature</li>
                </ol>
              </div>
            </div>

            <h3 class="sign-options-title">Choose how to sign your document</h3>
            
            <div class="options-container">
              <div class="option-card">
                <div class="option-label">OPTION 1</div>
                <div>Click the button below to open the Bhutan NDI Wallet directly on this device</div>
                <a href="${deepLinkUrl}" class="button">
                  OPEN BHUTAN NDI WALLET
                </a>
              </div>
              
              <div class="or-divider">
                <span class="or-text">OR</span>
              </div>
              
              <div class="option-card">
                <div class="option-label">OPTION 2</div>
                <div>Scan this QR Code with Bhutan NDI Wallet</div>
              <div class="qrcode">
                  <img src="cid:qrcode" alt="QR Code">
                </div>
              </div>
            </div>
            
            <p class="footer-text">After accessing the document through either method, you will be directed to the signature page where you can review and apply your digital signature.</p>
            
            <p class="footer-text">Thank you for using the Bhutan NDI Digital Signature Portal.</p>
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
