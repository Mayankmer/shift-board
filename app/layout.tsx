import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Employee Shift Board",
  description: "A simple web app to manage employee shifts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}