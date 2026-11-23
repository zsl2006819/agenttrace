import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentTrace",
  description: "AgentTrace - AI Agent Audit and Compliance Infrastructure",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        />
        <meta name="google" content="notranslate" />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}