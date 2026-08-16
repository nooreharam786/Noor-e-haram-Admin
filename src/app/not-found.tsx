import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 text-center shadow-card">
        <p className="text-sm font-semibold text-gold">Noor E Haram</p>
        <h1 className="mt-2 text-3xl font-semibold text-emerald-deep">Page not found</h1>
        <p className="mt-3 text-sm text-stone-500">The admin route you opened does not exist.</p>
        <Link className="btn-primary mt-6" href="/">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
