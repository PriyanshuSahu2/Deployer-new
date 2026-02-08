"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconBrandGithub, IconCheck, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const GithubCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Connecting to GitHub...");

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage("Authorization failed. Please try again.");
        notifications.show({
          color: "red",
          title: "GitHub login failed",
          message: "Authorization was denied",
        });
        setTimeout(() => router.replace("/login"), 3000);
        return;
      }

      try {
        setMessage("Finalizing authentication...");

       

        await new Promise((r) => setTimeout(r, 1200));

        setStatus("success");
        setMessage("Successfully authenticated!");

        notifications.show({
          color: "green",
          title: "Welcome!",
          message: "Logged in with GitHub successfully",
        });

        setTimeout(() => {
          router.replace("/");
        }, 2000);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Authentication failed. Please try again.");
        notifications.show({
          color: "red",
          title: "Authentication failed",
          message: "Something went wrong",
        });
        setTimeout(() => router.replace("/login"), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Status Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {status === "loading" && (
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
              )}

              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                  status === "loading"
                    ? "bg-gradient-to-br from-blue-500 to-purple-600"
                    : status === "success"
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-red-500 to-rose-600"
                }`}
              >
                {status === "loading" && (
                  <IconBrandGithub
                    size={48}
                    className="text-white animate-pulse"
                  />
                )}
                {status === "success" && (
                  <IconCheck size={48} className="text-white animate-bounce" />
                )}
                {status === "error" && (
                  <IconX size={48} className="text-white" />
                )}
              </div>

              {status === "success" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
                  <div
                    className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-10"
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Status message */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {status === "loading" && "Authenticating..."}
              {status === "success" && "Welcome!"}
              {status === "error" && "Oops!"}
            </h2>

            <p className="text-blue-100 text-lg">{message}</p>

            {status === "loading" && (
              <div className="flex justify-center gap-2 pt-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Branding */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-blue-200 opacity-60">
              Secured by GitHub OAuth 2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GithubCallback;
