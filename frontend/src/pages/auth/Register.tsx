import {
  TextInput,
  PasswordInput,
  Button,
  Divider,
  Text,
  Checkbox,
} from "@mantine/core";
import {
  IconBrandGithub,
  IconRocket,
  IconCloudUpload,
  IconServer,
  IconCheck,
  IconCloudComputing,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { LeftSection } from "./components/LeftSection";
import { Link } from "react-router-dom";

const Register = () => {
  const deploymentSteps = [
    {
      icon: IconCloudUpload,
      title: "Upload Your Code",
      desc: "Push your project to our platform",
    },
    {
      icon: IconCloudComputing,
      title: "Give Access To Your Server",
      desc: "Provide your SSH key or credentials.",
    },
    {
      icon: IconServer,
      title: "Automated Build",
      desc: "We build and optimize your application",
    },
    {
      icon: IconRocket,
      title: "Deploy Instantly",
      desc: "Go live in seconds, not hours",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {}, 3000);
    return () => clearInterval(interval);
  }, [deploymentSteps.length]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <LeftSection />

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-slate-500">To use our product</p>
            </div>

            <div className="space-y-3 mb-6">
              <Button
                fullWidth
                variant="default"
                size="md"
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
                Sign up with Google
              </Button>
              <Button
                fullWidth
                variant="default"
                size="md"
                leftSection={
                  <div className="w-5 h-5 flex items-center justify-center bg-slate-900 rounded-full p-0.5">
                    <IconBrandGithub size={16} className="text-white" />
                  </div>
                }
                className="transition-all duration-200 hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md"
              >
                Sign up with GitHub
              </Button>
            </div>

            <Divider
              label={
                <Text size="sm" c="dimmed">
                  Or sign up with email
                </Text>
              }
              labelPosition="center"
              className="my-6"
            />

            <form className="space-y-4">
              <div className="relative group">
                <TextInput
                  label="Username"
                  placeholder="Choose a username"
                  size="md"
                  className="transition-all duration-200"
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
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  size="md"
                  className="transition-all duration-200"
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
                  placeholder="Create a password"
                  size="md"
                  className="transition-all duration-200"
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
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  size="md"
                  className="transition-all duration-200"
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

              <div className="pt-2">
                <label className="flex items-start cursor-pointer group">
                  <Checkbox
                    size="xs"
                    className="mt-0.5"
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
                  <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              <Button
                fullWidth
                size="md"
                className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                Create Account
              </Button>
            </form>

            <div className="text-center mt-6">
              <Text size="sm" c="dimmed">
                Already have an account?{" "}
                <Link to={"/"}>
                  <Button
                    variant="subtle"
                    px={"xs"}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold transition-all duration-200"
                  >
                    Sign in
                  </Button>
                </Link>
              </Text>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Secure Signup</span>
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
  );
};

export default Register;
