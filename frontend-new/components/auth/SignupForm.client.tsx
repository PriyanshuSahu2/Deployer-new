"use client";

import {
  LoadingOverlay,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Checkbox,
  Divider,
} from "@mantine/core";
import { IconBrandGithub, IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useRegister } from "@/hooks/useAuth";
import OAuthButtons from "./OAuthButtons.client";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTC?: string;
}

const SignupForm = () => {
  const router = useRouter();
  const { mutateAsync: handleRegister, isPending } = useRegister();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTC: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (
    name: string,
    value: string | boolean,
  ): string | undefined => {
    switch (name) {
      case "username":
        if (!value) return "Username is required";
        if (typeof value === "string") {
          if (value.length < 3) return "Username must be at least 3 characters";
          if (value.length > 20)
            return "Username must not exceed 20 characters";
          if (!/^[a-zA-Z0-9_]+$/.test(value))
            return "Only letters, numbers & underscores allowed";
        }
        return;

      case "email":
        if (!value) return "Email is required";
        if (
          typeof value === "string" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        )
          return "Invalid email address";
        return;

      case "password":
        if (!value) return "Password is required";
        if (typeof value === "string") {
          if (value.length < 8) return "Minimum 8 characters required";
          if (!/(?=.*[a-z])/.test(value))
            return "Must include a lowercase letter";
          if (!/(?=.*[A-Z])/.test(value))
            return "Must include an uppercase letter";
          if (!/(?=.*\d)/.test(value)) return "Must include a number";
        }
        return;

      case "confirmPassword":
        if (!value) return "Please confirm password";
        if (value !== form.password) return "Passwords do not match";
        return;

      case "acceptTC":
        if (!value) return "You must accept the terms";
        return;

      default:
        return;
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    (Object.keys(form) as (keyof typeof form)[]).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, form[name as keyof typeof form]),
    }));
  };

  const handleSubmit = async () => {
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTC: true,
    });

    if (!validateForm()) {
      notifications.show({
        color: "red",
        title: "Validation error",
        message: "Please fix the errors before submitting",
      });
      return;
    }

    try {
      const res = await handleRegister({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      notifications.show({
        color: "green",
        title: "Account created",
        message: res.message || "Registration successful!",
      });

      router.push("/login");
    } catch (err: any) {
      notifications.show({
        color: "red",
        title: "Registration failed",
        message: err.message || "Something went wrong",
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8  relative">
        <LoadingOverlay visible={isPending} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-slate-500">To use our product</p>
        </div>
        <OAuthButtons disabled={isPending} />

        <Divider label="Or continue with email" my="lg" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <TextInput
            label="Username"
            value={form.username}
            error={touched.username && errors.username}
            onChange={(e) => handleChange("username", e.target.value)}
            onBlur={() => handleBlur("username")}
          />

          <TextInput
            label="Email"
            value={form.email}
            error={touched.email && errors.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
          />

          <PasswordInput
            label="Password"
            value={form.password}
            error={touched.password && errors.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
          />

          <PasswordInput
            label="Confirm Password"
            value={form.confirmPassword}
            error={touched.confirmPassword && errors.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
          />

          <Checkbox
            label="I agree to the Terms & Privacy Policy"
            checked={form.acceptTC}
            onChange={(e) => handleChange("acceptTC", e.target.checked)}
          />

          {touched.acceptTC && errors.acceptTC && (
            <Text size="xs" c="red">
              {errors.acceptTC}
            </Text>
          )}

          <Button type="submit" fullWidth loading={isPending}>
            Create Account
          </Button>
        </form>

        <Text size="sm" ta="center" mt="md">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold">
            Sign in
          </Link>
        </Text>

        <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Secure Signup
          </span>
          <span className="flex items-center gap-1">
            <IconCheck size={14} />
            Secured Data
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
