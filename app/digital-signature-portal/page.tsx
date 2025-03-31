import SignatureForm from "@/components/signature/SignatureForm";

export default function DigitalSignaturePage() {
  return (
    <main className="flex flex-col items-center pt-16 sm:pt-20 md:pt-24 px-4 pb-12">
      <div className="w-full max-w-3xl mx-auto">
        <SignatureForm />
      </div>
    </main>
  );
}
