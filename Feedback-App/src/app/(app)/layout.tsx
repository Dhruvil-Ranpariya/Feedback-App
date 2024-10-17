import Navbar from "@/components/navbar";
import Footter from "@/components/footer";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body>
          <Navbar/>
          {children}
          <Footter/>
        </body>
    </html>
  );
}
