import { Starfield } from "@/components/starfield/Starfield";
import { Navbar } from "@/components/Navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Starfield />
      <Navbar />
      <main className="relative z-10">{children}</main>
    </>
  );
}
