// app/page.tsx
import SignatureForm from "../components/SignatureForm";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#F8F8FF]">
      <SignatureForm />
    </main>
  );
}
