import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconLock, IconKey } from "@tabler/icons-react";
import { TextInput, PasswordInput, Button } from "@mantine/core";
import { toast } from "react-toastify";
import { publicRequest } from "../../config/requestMethod";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [form, setForm] = useState({
    email: emailFromState,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    }

    if (!form.otp || form.otp.length !== 6) {
      newErrors.otp = "Please enter the 6-digit OTP";
    }

    if (!form.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Resetting password...");

    try {
      const res = await publicRequest.post("/auth/reset-password", {
        email: form.email,
        otp: form.otp,
        new_password: form.newPassword,
      });

      toast.update(toastId, {
        type: "success",
        render: res.data.message || "Password reset successfully!",
        isLoading: false,
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.update(toastId, {
        type: "error",
        render: err?.response?.data?.error || "Failed to reset password",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
              <IconLock size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Reset Password
            </h1>
            <p className="text-slate-500">Enter the OTP sent to your email</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              size="md"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loading}
              error={errors.email}
              styles={{
                label: { fontWeight: 500, color: "#475569" },
              }}
            />

            <TextInput
              label="OTP Code"
              placeholder="Enter 6-digit OTP"
              size="md"
              value={form.otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                handleChange("otp", value);
              }}
              disabled={loading}
              error={errors.otp}
              leftSection={<IconKey size={18} />}
              styles={{
                label: { fontWeight: 500, color: "#475569" },
                input: {
                  letterSpacing: "0.5em",
                  textAlign: "center",
                  fontSize: "1.25rem",
                },
              }}
            />

            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              size="md"
              value={form.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              disabled={loading}
              error={errors.newPassword}
              styles={{
                label: { fontWeight: 500, color: "#475569" },
              }}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              size="md"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              disabled={loading}
              error={errors.confirmPassword}
              styles={{
                label: { fontWeight: 500, color: "#475569" },
              }}
            />

            <Button
              fullWidth
              size="md"
              disabled={loading}
              onClick={handleSubmit}
              className="mt-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Reset Password
            </Button>

            <div className="text-center">
              <Button
                variant="subtle"
                size="sm"
                disabled={loading}
                onClick={() => navigate("/forgot-password")}
                className="text-slate-600 hover:text-slate-800"
              >
                Didn't receive OTP? Resend
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
