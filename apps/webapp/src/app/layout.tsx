import "@/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { pg } from "@/server/db";

export const metadata: Metadata = {
    title: "Scalara",
};

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    // Run a raw SQL query against PostgreSQL to list table names
    const tables = await pg.query<{ table_name: string }>(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
`);

    return (
        <html lang="en" className={geist.variable} suppressHydrationWarning>
            <body>
                <TRPCReactProvider>
                    {children}
                    {JSON.stringify(tables)}
                </TRPCReactProvider>
            </body>
        </html>
    );
}
