import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={{ primaryColor: "indigo" }}>
        <App />
        <ToastContainer
          autoClose={3000}
          limit={3}
          newestOnTop
          closeButton={true}
        />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
