"use client";

import {
  TextInput,
  PasswordInput,
  Button,
  Divider,
  Text,
  Checkbox,
  LoadingOverlay,
} from "@mantine/core";
import { IconCheck, IconRocket } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import OAuthButtons from "./OAuthButtons.client";
import { useLogin } from "@/hooks/useAuth";
import { notifications } from "@mantine/notifications";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async () => {
    const notificationId = notifications.show({
      loading: true,
      title: "Logging in",
      message: "Please wait...",
      autoClose: false,
      withCloseButton: false,
    });

    try {
      const res = await login(form);

      const token = res.data.access_token;
      form.rememberMe
        ? localStorage.setItem("accessToken", token)
        : sessionStorage.setItem("accessToken", token);

      router.replace("/app");

      notifications.update({
        id: notificationId,
        title: "Login successful!",
        message: "You have been logged in.",
        color: "green",
        loading: false,
        autoClose: 3000,
      });
    } catch (err: any) {
      notifications.update({
        id: notificationId,
        title: "Login failed",
        message: err.response?.data?.message || "An error occurred.",
        color: "red",
        loading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8 relative">
        <LoadingOverlay visible={isPending} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl mb-4 items-center justify-center">
            <IconRocket className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-slate-500">Sign in to continue</p>
        </div>

        <OAuthButtons disabled={isPending} />

        <Divider label="Or continue with email" my="lg" />

        <TextInput
          label="Username or Email"
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
        />

        <PasswordInput
          mt="md"
          label="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Checkbox
          mt="md"
          label="Remember me"
          checked={form.rememberMe}
          onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
        />

        <Button fullWidth mt="xl" onClick={handleSubmit} loading={isPending}>
          Sign In
        </Button>
        <Text size="sm" ta="center" mt="md">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 font-semibold">
            Sign up
          </Link>
        </Text>

        <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Secure Login
          </span>
          <span className="flex items-center gap-1">
            <IconCheck size={14} />
            Secured Data
          </span>
        </div>
      </div>
    </div>
  );
}
