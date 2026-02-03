"use client";

import { Button } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

export default function OAuthButtons({ disabled }: { disabled?: boolean }) {
  const googleLogin = () => {
    const redirect = `${window.location.origin}/auth/google/callback`;

    window.location.href =
      `${process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL}` +
      `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${redirect}` +
      `&response_type=code` +
      `&scope=openid email profile`;
  };

  return (
    <div className="space-y-3 mb-6">
      <Button
        fullWidth
        variant="default"
        onClick={googleLogin}
        disabled={disabled}
      >
        Continue with Google
      </Button>

      <Button
        fullWidth
        variant="default"
        leftSection={<IconBrandGithub size={16} />}
        disabled={disabled}
      >
        Continue with GitHub
      </Button>
    </div>
  );
}
