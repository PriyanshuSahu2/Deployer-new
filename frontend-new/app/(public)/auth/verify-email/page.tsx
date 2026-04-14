"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconMailCheck, IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { apiFetch } from "@/lib/api";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Authenticating...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        setMessage("Verifying your email address...");

        const res = await apiFetch("/api/auth/verify-email", {
          method: "POST",
          body: { token },
        });

        setStatus("success");
        setMessage((res as { data?: { message?: string } })?.data?.message || "Email verified successfully!");

        setTimeout(() => {
          router.replace("/auth/login");
        }, 3000);
      } catch (err: unknown) {
        console.error(err);
        setStatus("error");
        type AxiosLike = { response?: { data?: { error?: string } } };
        const axiosErr = err as AxiosLike;
        setMessage(
          axiosErr?.response?.data?.error ||
          "Verification failed. Token may be invalid or expired.",
        );

        notifications.show({
          title: "Verification Failed",
          message: "Email verification failed",
          color: "red",
        });
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Status Icon */}
          <div className="flex justify-center mb-8">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${status === "loading"
                  ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                  : status === "success"
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-red-500 to-rose-600"
                }`}
            >
              {status === "loading" && (
                <IconMailCheck size={48} className="text-white animate-pulse" />
              )}
              {status === "success" && (
                <IconCheck size={48} className="text-white" />
              )}
              {status === "error" && <IconX size={48} className="text-white" />}
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {status === "loading" && "Verifying Email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </h2>

            <p className="text-blue-100 text-lg">{message}</p>

            {status === "error" && (
              <div className="space-y-3 pt-4">
                <Button
                  fullWidth
                  onClick={() => router.push("/auth/email-not-verified")}
                >
                  Request New Link
                </Button>

                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => router.push("/auth/login")}
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
