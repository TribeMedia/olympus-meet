import "@/app/globals.css"
import "@livekit/components-styles"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeInitializer } from "@/components/theme-initializer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "LiveKit Video Conference",
  description: "A video conferencing app built with LiveKit and Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ThemeInitializer />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}