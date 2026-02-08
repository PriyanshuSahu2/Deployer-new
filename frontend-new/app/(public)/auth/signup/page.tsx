import { LeftSection } from "@/components/auth/AuthLeftSection";
import SignupForm from "@/components/auth/SignupForm.client";


export default function SignupPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <LeftSection />
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <SignupForm />
      </div>
    </div>
  );
}
