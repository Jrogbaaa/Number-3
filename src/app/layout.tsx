import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Props - Lead Management",
  description: "AI-powered lead management and outreach platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#0D1117] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
