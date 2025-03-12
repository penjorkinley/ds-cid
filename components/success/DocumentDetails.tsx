import { UploadResponse } from "../../services/ds-api";

interface DocumentDetailsProps {
  response: UploadResponse;
}

export default function DocumentDetails({ response }: DocumentDetailsProps) {
  const details = [
    { label: "Document ID", value: response.documentId, isMono: true },
    { label: "Document Hash", value: response.documentHash, isMono: true },
    { label: "Document URL", value: response.documentUrl, isBreakAll: true },
    { label: "Name", value: response.name },
    { label: "Email", value: response.email },
    { label: "Holder DID", value: response.holderDid },
    { label: "Organization ID", value: response.organizationId },
  ];

  return (
    <dl className="text-sm text-green-600">
      {details.map((detail, index) => (
        <div
          key={detail.label}
          className={`mb-${index === details.length - 1 ? "4" : "1"}`}
        >
          <dt className="font-medium inline">{detail.label}: </dt>
          <dd
            className={`inline ${detail.isMono ? "font-mono" : ""} ${
              detail.isBreakAll ? "break-all" : ""
            }`}
          >
            {detail.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
