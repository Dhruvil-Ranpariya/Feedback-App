import Navbar from "@/components/navbar";
import Footter from "@/components/footer";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className="flex flex-col min-h-screen">
          <Navbar/>
          {children}
          <Footter/>
        </body>
    </html>
  );
}
