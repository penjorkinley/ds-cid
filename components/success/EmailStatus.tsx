interface EmailStatusProps {
  status: string | null;
}

export default function EmailStatus({ status }: EmailStatusProps) {
  if (!status) return null;

  return (
    <div
      className={`p-3 mb-4 rounded-md text-sm ${
        status.includes("Failed")
          ? "bg-red-50 border border-red-200 text-red-600"
          : "bg-blue-50 border border-blue-200 text-blue-600"
      }`}
    >
      {status}
    </div>
  );
}
