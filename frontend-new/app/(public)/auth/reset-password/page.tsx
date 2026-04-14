"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconLock, IconKey, IconCheck, IconX } from "@tabler/icons-react";
import { TextInput, PasswordInput, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useResetPassword } from "@/hooks/useAuth";

import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Authenticating...</div>}>
            <ResetPassword />
        </Suspense>
    );
}
const ResetPassword = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const emailFromQuery = searchParams.get("email") || "";

    const [form, setForm] = useState({
        email: emailFromQuery,
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});


    const { mutateAsync: handleResetPassword, isPending } = useResetPassword();
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.email) newErrors.email = "Email is required";

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
            notifications.show({
                color: "red",
                title: "Validation error",
                message: "Please fix the highlighted fields",
                icon: <IconX size={18} />,
            });
            return;
        }

        setLoading(true);

        const notifId = notifications.show({
            loading: true,
            title: "Resetting password",
            message: "Please wait...",
            autoClose: false,
            withCloseButton: false,
        });

        try {
            const res = await handleResetPassword({
                email: form.email,
                otp: form.otp,
                new_password: form.newPassword,
            });

            notifications.update({
                id: notifId,
                color: "green",
                title: "Success",
                message: res.data.message || "Password reset successfully!",
                icon: <IconCheck size={18} />,
                loading: false,
                autoClose: 3000,
            });

            setTimeout(() => {
                router.push("/auth/login");
            }, 1500);
        } catch (err: unknown) {
            type AxiosLike = { response?: { data?: { message?: string } } };
            const axiosErr = err as AxiosLike;
            notifications.update({
                id: notifId,
                color: "red",
                title: "Error",
                message:
                    axiosErr?.response?.data?.message || "Failed to reset password",
                icon: <IconX size={18} />,
                loading: false,
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
                        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                        <p className="text-slate-500">
                            Enter the OTP sent to your email
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <TextInput
                            label="Email Address"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            disabled={loading}
                            error={errors.email}
                        />

                        <TextInput
                            label="OTP Code"
                            value={form.otp}
                            onChange={(e) =>
                                handleChange(
                                    "otp",
                                    e.target.value.replace(/\D/g, "").slice(0, 6)
                                )
                            }
                            disabled={loading}
                            error={errors.otp}
                            leftSection={<IconKey size={18} />}
                        />

                        <PasswordInput
                            label="New Password"
                            value={form.newPassword}
                            onChange={(e) =>
                                handleChange("newPassword", e.target.value)
                            }
                            disabled={loading}
                            error={errors.newPassword}
                        />

                        <PasswordInput
                            label="Confirm Password"
                            value={form.confirmPassword}
                            onChange={(e) =>
                                handleChange("confirmPassword", e.target.value)
                            }
                            disabled={loading}
                            error={errors.confirmPassword}
                        />

                        <Button
                            fullWidth
                            size="md"
                            loading={loading}
                            onClick={handleSubmit}
                            className="mt-6"
                        >
                            Reset Password
                        </Button>

                        <div className="text-center">
                            <Button
                                variant="subtle"
                                size="sm"
                                onClick={() => router.push("/auth/forgot-password")}
                            >
                                Didn’t receive OTP? Resend
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
