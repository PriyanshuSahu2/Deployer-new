import { useEffect, useState } from "react";
import {
  IconRocket,
  IconCloudUpload,
  IconServer,
  IconCheck,
  IconCloudComputing,
} from "@tabler/icons-react";
export const LeftSection = () => {
  const [activeStep, setActiveStep] = useState(0);

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
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % deploymentSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-lg">
        <div className="text-white mb-12">
          <h2 className="text-4xl font-bold mb-4">Deploy with Confidence</h2>
          <p className="text-blue-100 text-lg">
            Ship your applications faster with our automated deployment platform
          </p>
        </div>

        {/* Deployment Steps Animation */}
        <div className="space-y-6">
          {deploymentSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-500 ${
                  isActive
                    ? "bg-white/20 scale-105 shadow-lg"
                    : isPast
                    ? "bg-white/5"
                    : "bg-white/5 opacity-60"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? "bg-white text-blue-600 shadow-xl scale-110"
                      : isPast
                      ? "bg-green-500 text-white"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {isPast && !isActive ? (
                    <IconCheck
                      size={24}
                      className="animate-in fade-in zoom-in"
                    />
                  ) : (
                    <Icon size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-1 transition-all duration-300 ${
                      isActive ? "text-white text-lg" : "text-blue-100"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm transition-all duration-300 ${
                      isActive ? "text-blue-50" : "text-blue-200/70"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex gap-2">
          {deploymentSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === activeStep
                  ? "w-12 bg-white"
                  : index < activeStep
                  ? "w-8 bg-green-400"
                  : "w-8 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 grid text-center gap-6 pt-6 border-t border-white/20">
          {/* <div className="text-center">
        <div className="text-3xl font-bold text-white mb-1">0</div>
        <div className="text-sm text-blue-200">Deployments</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-1">99.9%</div>
        <div className="text-sm text-blue-200">Uptime</div>
      </div> */}
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">&lt;10m</div>
            <div className="text-sm text-blue-200">Deploy Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};
