// app/api/process-document/route.ts
import { NextResponse } from "next/server";

interface DocumentData {
  documentId: string;
  documentHash: string;
  documentUrl: string;
  name: string;
  holderDid: string;
  organizationId: string;
}

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const data = url.searchParams.get("data");

    if (!data || typeof data !== "string") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Decode Base64 data
    const decodedData = Buffer.from(data, "base64").toString("utf-8");
    const documentData = JSON.parse(decodedData) as DocumentData;

    // Process the data (e.g., save to database)
    console.log("Processing document data:", documentData);

    // Return JSON with success message AND data
    return NextResponse.json(
      {
        success: true,
        message: "Data processed successfully",
        data: documentData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing data:", error);
    return NextResponse.json(
      { error: "Failed to process data" },
      { status: 500 }
    );
  }
}
