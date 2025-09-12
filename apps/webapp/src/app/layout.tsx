import "@/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { getSharedNumber } from "@scalara/shared";
import { env } from "@/env";

export const metadata: Metadata = {
    title: "Scalara",
};

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const sharedNumber = getSharedNumber(env);

    return (
        <html lang="en" className={geist.variable} suppressHydrationWarning>
            <body>
                <TRPCReactProvider>
                    {children}
                    {sharedNumber}
                </TRPCReactProvider>
            </body>
        </html>
    );
}
