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
      <body className="bg-[#0f172a] text-white">
        <Navbar/>
        <main className="px-6 md:px-20 py-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
