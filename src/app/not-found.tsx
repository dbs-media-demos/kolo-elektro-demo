import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-start justify-center px-[var(--gutter)]">
      <LogoMark className="h-12 w-12" />
      <p className="t-label mt-10 text-spark">404</p>
      <h1 className="t-display t-lg mt-4 max-w-[14ch]">Ovde nema struje.</h1>
      <p className="t-lead mt-6 max-w-md">Link je možda star, ili je pregled uklonjen.</p>
      <Link href="/" className="btn btn-spark mt-10">
        Nazad na početnu
      </Link>
    </main>
  );
}
