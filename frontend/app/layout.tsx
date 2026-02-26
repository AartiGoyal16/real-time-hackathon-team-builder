import "./globals.css";
import Navbar from "@/components/Navbar";

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
        <Navbar/>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
