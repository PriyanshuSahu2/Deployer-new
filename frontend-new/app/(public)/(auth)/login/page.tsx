import { LeftSection } from "@/components/auth/AuthLeftSection";
import LoginForm from "@/components/auth/LoginForm.client";


export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <LeftSection />
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <LoginForm />
      </div>
    </div>
  );
}
