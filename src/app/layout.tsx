import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIDYA AI — Research & Knowledge OS",
  description: "Next-Generation Multimodal AI Study & Research Workspace powered by LangGraph, ChromaDB, and Vision AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="h-full flex flex-col antialiased bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container font-sans">
        {children}
      </body>
    </html>
  );
}
