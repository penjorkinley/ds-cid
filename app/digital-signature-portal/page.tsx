import SignatureForm from "@/components/signature/SignatureForm";

export default function DigitalSignaturePage() {
  return (
    <main className="flex flex-col items-center pt-12 sm:pt-16 md:pt-16 px-4 pb-12">
      <div className="w-full max-w-3xl mx-auto">
        <SignatureForm />
      </div>
    </main>
  );
}
