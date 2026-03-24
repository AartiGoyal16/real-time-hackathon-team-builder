import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Real-Time Hackathon Team Builder",
  description: "An application that enables developers to connect, build teams, and collaborate in real-time during hackathons.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black font-sans min-h-screen flex flex-col">
        <ThemeProvider>
            <Navbar/>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
