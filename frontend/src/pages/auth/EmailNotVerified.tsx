import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconMail, IconMailForward, IconCheck } from "@tabler/icons-react";
import { TextInput, Button } from "@mantine/core";
import { toast } from "react-toastify";
import { publicRequest } from "../../config/requestMethod";

const EmailNotVerified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResendEmail = async () => {
    if (!email || !email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending verification email...");

    try {
      const res = await publicRequest.post("/auth/resend-verification", {
        email: email,
      });

      toast.update(toastId, {
        type: "success",
        render: res.data.message || "Verification email sent successfully!",
        isLoading: false,
        autoClose: 3000,
      });

      setEmailSent(true);
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setEmailSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast.update(toastId, {
        type: "error",
        render:
          err?.response?.data?.error || "Failed to send verification email",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
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
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center">
                <IconMail size={48} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
            <p className="text-blue-100 text-base">
              Your account is not verified yet. Please check your email for the
              verification link.
            </p>
          </div>

          {/* Email sent confirmation */}
          {emailSent && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3 text-green-100">
                <IconCheck size={20} className="flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Verification email sent!</p>
                  <p className="text-green-200">
                    Check your inbox and spam folder
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-4 mb-6">
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              size="md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || emailSent}
              leftSection={<IconMail size={18} />}
              classNames={{
                label: "text-blue-100 font-medium mb-2",
                input:
                  "bg-white/10 border-white/20 text-white placeholder:text-blue-200/50",
              }}
            />

            <Button
              fullWidth
              size="md"
              disabled={loading || emailSent}
              onClick={handleResendEmail}
              leftSection={<IconMailForward size={20} />}
              className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {emailSent
                ? `Resend in ${countdown}s`
                : "Send Verification Email"}
            </Button>
          </div>

          {/* Info box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-blue-100 font-semibold mb-2 flex items-center gap-2">
              <IconMail size={18} />
              Didn't receive the email?
            </h3>
            <ul className="text-sm text-blue-200 space-y-1.5 ml-6">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few minutes for the email to arrive</li>
              <li>• Click the button above to resend</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              fullWidth
              variant="outline"
              size="md"
              onClick={() => navigate("/login")}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Back to Login
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-blue-200 opacity-60">
              Need help? Contact our support team
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
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

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default EmailNotVerified;
