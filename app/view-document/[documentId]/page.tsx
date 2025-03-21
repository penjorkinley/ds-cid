// app/view-document/[documentId]/page.tsx
import DocumentViewer from "@/components/DocumentViewer";

export default function ViewDocumentPage({
  params,
}: {
  params: { documentId: string };
}) {
  return (
    <main className="flex flex-col items-center py-8 px-4">
      <DocumentViewer documentId={params.documentId} />
    </main>
  );
}
