import VerificationForm from "@/components/verification/VerificationForm";

export default function VerificationPage() {
  return (
    <main className="flex flex-col items-center pt-16 sm:pt-16 md:pt-16 px-4 pb-12">
      <div className="w-full max-w-3xl mx-auto">
        <VerificationForm />
      </div>
    </main>
  );
}
