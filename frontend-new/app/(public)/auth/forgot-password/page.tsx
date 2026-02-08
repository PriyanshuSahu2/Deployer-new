"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconKey, IconMail, IconArrowLeft } from "@tabler/icons-react";
import { TextInput, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

const ForgotPassword = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      notifications.show({
        color: "red",
        title: "Invalid email",
        message: "Please enter your email address",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notifications.show({
        color: "red",
        title: "Invalid email",
        message: "Please enter a valid email address",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send reset email");
      }

      notifications.show({
        color: "green",
        title: "Email sent",
        message: data.message || "Password reset email sent!",
      });

      setEmailSent(true);

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      notifications.show({
        color: "red",
        title: "Request failed",
        message: err.message || "Failed to send reset email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg">
              <IconKey size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h1>
            <p className="text-slate-500">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
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
              disabled={loading || emailSent}
              leftSection={<IconMail size={18} />}
            />

            <Button
              fullWidth
              size="md"
              type="submit"
              disabled={loading || emailSent}
              loading={loading}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-200"
            >
              {emailSent ? "Email Sent!" : "Send Reset Link"}
            </Button>

            <Button
              fullWidth
              variant="subtle"
              size="md"
              disabled={loading}
              onClick={() => router.push("/login")}
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
};

export default ForgotPassword;
