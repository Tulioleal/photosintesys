import type { Metadata } from "next";
import { Bodoni_Moda, Roboto } from "next/font/google";
import "@/app/globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Photosynthesis — Plant Identifier",
  description:
    "Mobile-first app to recognize plants and learn how to care for them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodoni.variable} ${roboto.variable} antialiased bg-white`}
      >
        {children}
      </body>
    </html>
  );
}
