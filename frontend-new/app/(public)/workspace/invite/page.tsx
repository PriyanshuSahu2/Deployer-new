"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconBuildingCommunity,
  IconCheck,
  IconClockOff,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAcceptWorkspaceInvite, useDeclineWorkspaceInvite, useGetWorkspaceInviteByToken } from "@/hooks/useInvites";

type Status = "loading" | "success" | "expired" | "error";

interface InviteDetails {
  workspaceName: string;
  invitedBy: string;
  role: string;
}
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Authenticating...</div>}>
      <WorkspaceInvite />
    </Suspense>
  );
}
const WorkspaceInvite = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your invitation...");
  const [invite, setInvite] = useState<InviteDetails | null>(null);

  const { mutateAsync: getWorkspaceInviteByTokenAsync } =
    useGetWorkspaceInviteByToken();

  const { mutateAsync: acceptWorkspaceInviteAsync } =
    useAcceptWorkspaceInvite();
  const { mutateAsync: declineWorkspaceInviteAsync } =
    useDeclineWorkspaceInvite();
  useEffect(() => {
    const validateInvite = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid invite link. No token provided.");
        return;
      }

      try {
        setMessage("Checking invite validity...");

        const res = await getWorkspaceInviteByTokenAsync(token);

        const data = res.data;
        const isExpired = data.status === "expired";

        if (isExpired) {
          setStatus("expired");
          setMessage("This invite link has expired or has already been used.");
          return;
        }

        setInvite({
          workspaceName: data.workspace_name,
          invitedBy: data.invited_by,
          role: data.role,
        });
        setStatus("success");
        setMessage("You've been invited to join a workspace!");
        // --- END MOCK LOGIC ---
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
        notifications.show({
          color: "red",
          title: "Verification failed",
          message: "Could not validate invite link",
        });
      }
    };

    validateInvite();
  }, [searchParams]);

  const handleAccept = async () => {
    try {

      await acceptWorkspaceInviteAsync(searchParams.get("token")!);

      notifications.show({
        color: "green",
        title: "Joined workspace!",
        message: `Welcome to ${invite?.workspaceName}`,
      });
      router.replace("/");
    } catch {
      notifications.show({
        color: "red",
        title: "Failed to join",
        message: "Could not accept the invite. Please try again.",
      });
    }
  };

  const handleDecline = async () => {
    try {

      await declineWorkspaceInviteAsync(searchParams.get("token")!);
      notifications.show({
        color: "green",
        title: "Invite declined",
        message: "You have declined the workspace invite.",
      });
      router.replace("/");
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Failed to decline",
        message: "Could not decline the invite. Please try again.",
      });
    }
  };

  const statusConfig: Record<
    Status,
    { icon: React.ReactNode; gradient: string; heading: string }
  > = {
    loading: {
      icon: (
        <IconBuildingCommunity size={48} className="text-white animate-pulse" />
      ),
      gradient: "from-violet-500 to-indigo-600",
      heading: "Verifying Invite...",
    },
    success: {
      icon: <IconCheck size={48} className="text-white animate-bounce" />,
      gradient: "from-emerald-500 to-teal-600",
      heading: "You're Invited!",
    },
    expired: {
      icon: <IconClockOff size={48} className="text-white" />,
      gradient: "from-amber-500 to-orange-600",
      heading: "Link Expired",
    },
    error: {
      icon: <IconX size={48} className="text-white" />,
      gradient: "from-red-500 to-rose-600",
      heading: "Invalid Link",
    },
  };

  const current = statusConfig[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {status === "loading" && (
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 border-r-indigo-400 animate-spin" />
              )}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br transition-all duration-500 ${current.gradient}`}
              >
                {current.icon}
              </div>
              {status === "success" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
                  <div
                    className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-10"
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">{current.heading}</h2>
            <p className="text-blue-100 text-base">{message}</p>
          </div>

          {/* Invite details (success) */}
          {status === "success" && invite && (
            <div className="mt-6 bg-white/10 rounded-2xl p-4 border border-white/10 space-y-2 text-sm text-blue-100">
              <div className="flex justify-between">
                <span className="opacity-60">Workspace</span>
                <span className="font-semibold text-white">
                  {invite.workspaceName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Invited by</span>
                <span className="font-semibold text-white">
                  {invite.invitedBy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Role</span>
                <span className="font-semibold text-white">{invite.role}</span>
              </div>
            </div>
          )}

          {/* Loading dots */}
          {status === "loading" && (
            <div className="flex justify-center gap-2 pt-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}

          {/* Actions (success) */}
          {status === "success" && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/30"
              >
                Accept Invite
              </button>
            </div>
          )}

          {/* Request new invite (expired / error) */}
          {(status === "expired" || status === "error") && (
            <div className="mt-6 space-y-3">
              {status === "expired" && (
                <p className="text-center text-xs text-blue-200 opacity-70">
                  Ask the workspace admin to send you a fresh invite link.
                </p>
              )}
              <button
                onClick={() => router.replace("/login")}
                className="w-full py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-blue-200 opacity-50">
              Workspace invites are single-use and expire after 7 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

