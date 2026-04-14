"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";
import { useResendVerification } from "@/hooks/useAuth";

export default function EmailNotVerifiedPage() {
  const router = useRouter();
  const { mutateAsync: resendVerification, isPending } = useResendVerification();

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      notifications.show({
        color: "red",
        title: "Email required",
        message: "Enter the email address tied to your account.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      notifications.show({
        color: "red",
        title: "Invalid email",
        message: "Enter a valid email address.",
      });
      return;
    }

    try {
      const res = await resendVerification({ email: trimmedEmail });
      setEmailSent(true);

      notifications.show({
        color: "green",
        title: "Verification sent",
        message:
          (res as { data?: { message?: string } })?.data?.message ||
          "A new verification email has been sent.",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resend verification email.";

      notifications.show({
        color: "red",
        title: "Request failed",
        message: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
              <IconMail size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Resend Verification
            </h1>
            <p className="text-slate-500">
              Enter your email and we&apos;ll send a fresh verification link.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="space-y-4"
          >
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              size="md"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending || emailSent}
              leftSection={<IconMail size={18} />}
            />

            <Button
              fullWidth
              size="md"
              type="submit"
              loading={isPending}
              disabled={isPending || emailSent}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
            >
              {emailSent ? "Verification Sent" : "Send Verification Link"}
            </Button>

            <Button
              fullWidth
              variant="subtle"
              size="md"
              disabled={isPending}
              onClick={() => router.push("/auth/login")}
              leftSection={<IconArrowLeft size={18} />}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              Back to Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
