import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconMailCheck, IconCheck, IconX, IconMail } from "@tabler/icons-react";
import { Button } from "@mantine/core";
import { toast } from "react-toastify";
import { publicRequest } from "../../config/requestMethod";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
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

        const res = await publicRequest.post("/auth/verify-email", {
          token: token,
        });

        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setMessage(
          err?.response?.data?.error ||
            "Verification failed. Token may be invalid or expired."
        );
        toast.error("Email verification failed");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Status Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Rotating ring */}
              {status === "loading" && (
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-indigo-500 animate-spin"></div>
              )}

              {/* Icon container */}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                  status === "loading"
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600 scale-100"
                    : status === "success"
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 scale-110"
                    : "bg-gradient-to-br from-red-500 to-rose-600 scale-110"
                }`}
              >
                {status === "loading" && (
                  <IconMailCheck
                    size={48}
                    className="text-white animate-pulse"
                  />
                )}
                {status === "success" && (
                  <IconCheck size={48} className="text-white animate-bounce" />
                )}
                {status === "error" && (
                  <IconX
                    size={48}
                    className="text-white"
                    style={{ animation: "shake 0.5s ease-in-out" }}
                  />
                )}
              </div>

              {/* Ripple effect for success */}
              {status === "success" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
                  <div
                    className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-10"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                </>
              )}
            </div>
          </div>

          {/* Status message */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {status === "loading" && "Verifying Email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </h2>

            <p className="text-blue-100 text-lg animate-fade-in">{message}</p>

            {/* Progress dots */}
            {status === "loading" && (
              <div className="flex justify-center gap-2 pt-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {/* Success checkmarks */}
            {status === "success" && (
              <div className="space-y-3 pt-4">
                {[
                  "Email verified",
                  "Account activated",
                  "Redirecting to login",
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-2 text-green-100"
                    style={{
                      animation: "slide-up 0.5s ease-out forwards",
                      animationDelay: `${i * 0.2}s`,
                      opacity: 0,
                    }}
                  >
                    <IconCheck size={16} className="text-green-400" />
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Error actions */}
            {status === "error" && (
              <div className="space-y-3 pt-4">
                <Button
                  fullWidth
                  size="md"
                  onClick={() => navigate("/email-not-verified")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Request New Link
                </Button>
                <Button
                  fullWidth
                  size="md"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>

          {/* Email verification branding */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-blue-200 opacity-60">
              Secure email verification
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;
