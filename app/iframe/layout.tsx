import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yoga Chatbot - Iframe",
  description: "Embeddable yoga chatbot for Marrickville Yoga Centre",
  robots: "noindex, nofollow", // Prevent indexing of iframe content
};

export default function IframeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{ margin: 0, padding: 0, width: "100%", height: "100%" }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden", // Prevent scrollbars in iframe
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        {children}
      </body>
    </html>
  );
}
