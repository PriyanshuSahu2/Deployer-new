import {
  TextInput,
  PasswordInput,
  Button,
  Divider,
  Text,
  Checkbox,
  LoadingOverlay,
} from "@mantine/core";
import { IconBrandGithub, IconCheck, IconRocket } from "@tabler/icons-react";
import { LeftSection } from "./components/LeftSection";
import { Link } from "react-router-dom";
import { useLogin } from "./queries/useAuth";
import { useState } from "react";
import { toast } from "react-toastify";

interface FormErrors {
  identifier?: string;
  password?: string;
}

const Login = () => {
  const { mutateAsync: handleLogin, isPending } = useLogin();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "identifier":
        if (!value.trim()) {
          return "Username or email is required";
        }
        if (value.length < 3) {
          return "Must be at least 3 characters";
        }
        return undefined;

      case "password":
        if (!value) {
          return "Password is required";
        }
        if (value.length < 6) {
          return "Password must be at least 6 characters";
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const identifierError = validateField("identifier", form.identifier);
    if (identifierError) newErrors.identifier = identifierError;

    const passwordError = validateField("password", form.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors] && typeof value === "string") {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "identifier" || name === "password") {
      const value = form[name];
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async () => {
    setTouched({ identifier: true, password: true });

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    const toastId = toast.loading("Logging in....", {
      autoClose: false,
      closeButton: true,
    });

    try {
      const res = await handleLogin(form);
      const data = res.data;

      if (form.rememberMe) {
        localStorage.setItem("accessToken", data["access_token"]);
      } else {
        sessionStorage.setItem("accessToken", data["access_token"]);
      }

      toast.update(toastId, {
        type: "success",
        render: "Login Successful!",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        type: "error",
        render: error?.["response"]?.["data"]?.["error"] || "Login failed",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleGithubOAuthLogin = () => {
    const REDIRECT_URI = `${window.location.origin}/auth/github/callback`;

    const oAuthUrl =
      import.meta.env.VITE_GITHUB_OAUTH_URL +
      `?client_id=${
        import.meta.env.VITE_GITHUB_CLIENT_ID
      }&redirect_uri=${REDIRECT_URI}&scope=user:email&state=${crypto.randomUUID()}`;
    window.location.href = oAuthUrl;
  };
  const handleGoogleOAuthLogin = () => {
    const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

    const oAuthUrl =
      import.meta.env.VITE_GOOGLE_OAUTH_URL +
      `?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=openid%20email%20profile` +
      `&state=${crypto.randomUUID()}`;

    window.location.href = oAuthUrl;
  };

  return (
    <>
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        <LeftSection />
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl border border-slate-100 relative">
              {/* Loading Overlay */}
              <LoadingOverlay
                visible={isPending}
                zIndex={1000}
                overlayProps={{
                  radius: "lg",
                  blur: 3,
                  style: { position: "absolute" },
                }}
                loaderProps={{
                  color: "blue",
                  type: "dots",
                  size: "lg",
                }}
              />

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                  <IconRocket size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h1>
                <p className="text-slate-500">
                  Sign in to continue to your account
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <Button
                  fullWidth
                  variant="default"
                  size="md"
                  onClick={() => handleGoogleOAuthLogin()}
                  disabled={isPending}
                  leftSection={
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                  }
                  className="transition-all duration-200 hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md"
                >
                  Continue with Google
                </Button>
                <Button
                  fullWidth
                  variant="default"
                  size="md"
                  disabled={isPending}
                  onClick={() => handleGithubOAuthLogin()}
                  leftSection={
                    <div className="w-5 h-5 flex items-center justify-center bg-slate-900 rounded-full p-0.5">
                      <IconBrandGithub size={16} className="text-white" />
                    </div>
                  }
                  className="transition-all duration-200 hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md"
                >
                  Continue with GitHub
                </Button>
              </div>

              <Divider
                label={
                  <Text size="sm" c="dimmed">
                    Or continue with email
                  </Text>
                }
                labelPosition="center"
                className="my-6"
              />

              <div className="space-y-4" onKeyPress={handleKeyPress}>
                <div className="relative group">
                  <TextInput
                    label="Username or Email"
                    placeholder="Enter your username or email"
                    size="md"
                    name="identifier"
                    value={form.identifier}
                    error={touched.identifier && errors.identifier}
                    disabled={isPending}
                    className="transition-all duration-200"
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    onBlur={() => handleBlur("identifier")}
                    styles={{
                      input: {
                        "&:focus": {
                          transform: "translateY(-1px)",
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
                </div>

                <div className="relative group">
                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    size="md"
                    name="password"
                    value={form.password}
                    error={touched.password && errors.password}
                    disabled={isPending}
                    className="transition-all duration-200"
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    onBlur={() => handleBlur("password")}
                    styles={{
                      input: {
                        "&:focus": {
                          transform: "translateY(-1px)",
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
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer group">
                    <Checkbox
                      size="xs"
                      checked={form.rememberMe}
                      disabled={isPending}
                      onChange={(e) =>
                        handleChange("rememberMe", e.target.checked)
                      }
                      styles={{
                        input: {
                          cursor: "pointer",
                          "&:checked": {
                            backgroundColor: "#3b82f6",
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    />
                    <span className="ml-2 text-slate-600 group-hover:text-slate-800 transition-colors font-medium">
                      Remember me
                    </span>
                  </label>
                  <Button
                    variant="subtle"
                    disabled={isPending}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium"
                    px="xs"
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  disabled={isPending}
                  fullWidth
                  size="md"
                  onClick={handleSubmit}
                  className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Button>
              </div>

              <div className="text-center mt-6">
                <Text size="sm" c="dimmed">
                  Don't have an account?{" "}
                  <Link to={"/register"}>
                    <Button
                      variant="subtle"
                      px={"xs"}
                      disabled={isPending}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold transition-all duration-200"
                    >
                      Sign up
                    </Button>
                  </Link>
                </Text>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Secure Login</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconCheck size={14} className="text-blue-600" />
                    <span className="font-medium">Secured Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
