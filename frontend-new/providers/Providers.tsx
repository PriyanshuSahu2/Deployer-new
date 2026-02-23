"use client";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MantineProvider
      theme={{
        primaryColor: "indigo",
      }}
    
    >
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-right" />
        <ModalsProvider>{children}</ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
