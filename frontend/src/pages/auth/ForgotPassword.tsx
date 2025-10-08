import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconKey, IconMail, IconArrowLeft } from "@tabler/icons-react";
import { TextInput, Button } from "@mantine/core";
import { toast } from "react-toastify";
import { publicRequest } from "../../config/requestMethod";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
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
    const toastId = toast.loading("Sending reset link...");

    try {
      const res = await publicRequest.post("/auth/forgot-password", {
        email: email,
      });

      toast.update(toastId, {
        type: "success",
        render: res.data.message || "Password reset email sent!",
        isLoading: false,
        autoClose: 3000,
      });

      setEmailSent(true);

      // Navigate to reset password page after 2 seconds
      setTimeout(() => {
        navigate("/reset-password", { state: { email: email } });
      }, 2000);
    } catch (err: any) {
      console.error(err);
      toast.update(toastId, {
        type: "error",
        render: err?.response?.data?.error || "Failed to send reset email",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
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
          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              size="md"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || emailSent}
              leftSection={<IconMail size={18} />}
              styles={{
                input: {
                  "&:focus": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  },
                },
                label: {
                  fontWeight: 500,
                  color: "#475569",
                },
              }}
            />

            <Button
              fullWidth
              size="md"
              disabled={loading || emailSent}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {emailSent ? "Email Sent!" : "Send Reset Link"}
            </Button>

            <Button
              fullWidth
              variant="subtle"
              size="md"
              disabled={loading}
              onClick={() => navigate("/login")}
              leftSection={<IconArrowLeft size={18} />}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
