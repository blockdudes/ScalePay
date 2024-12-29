import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PayScale | Decentralized Attendance & Payroll",
  description: "Blockchain-based attendance and payroll management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white">
        <ThirdwebProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-gray-900 text-white',
              duration: 3000
            }}
            containerStyle={{
              zIndex: 99999,
            }}
          />
        </ThirdwebProvider>
      </body>
    </html>
  );
}
