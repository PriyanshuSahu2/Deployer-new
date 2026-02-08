import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Deployer",
    template: "%s • Deployer",
  },
  description:
    "Deployer is a modern deployment platform that helps teams deploy applications from Git repositories with real-time logs, environment management, rollbacks, and team-based access control.",
  applicationName: "Deployer",
  keywords: [
    "deployment platform",
    "CI/CD",
    "self hosted deployment",
    "DevOps",
    "application deployment",
    "Git-based deployment",
    "Heroku alternative",
    "developer platform",
  ],
  authors: [{ name: "Deployer Team" }],
  creator: "Deployer",
  metadataBase: new URL("https://deployer.dev"), // change later
  openGraph: {
    title: "Deployer",
    description:
      "Deploy applications effortlessly with real-time logs, rollbacks, and workspace-based access control.",
    type: "website",
    siteName: "Deployer",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
