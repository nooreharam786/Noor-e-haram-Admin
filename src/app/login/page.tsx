"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, setToken } from "@/lib/api";

type LoginResponse = {
  user: {
    role: "user" | "admin";
  };
  token: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@nooreharam.in");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (data.user.role !== "admin") {
        throw new Error("This account does not have admin access");
      }

      setToken(data.token);
      toast.success("Welcome back");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Toaster richColors position="top-right" />
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 shadow-elevated">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-deep text-gold shadow-emerald">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-emerald-deep">NOOR E HARAM</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">Charity Foundation</p>
          <p className="mt-2 text-sm text-stone-500">Admin control center</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-stone-700">
            Email
            <span className="mt-2 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 focus-within:border-emerald-deep focus-within:ring-4 focus-within:ring-emerald-deep/10">
              <Mail className="h-4 w-4 text-stone-400" />
              <input
                className="h-11 w-full border-0 bg-transparent text-sm outline-none"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Password
            <span className="mt-2 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 focus-within:border-emerald-deep focus-within:ring-4 focus-within:ring-emerald-deep/10">
              <LockKeyhole className="h-4 w-4 text-stone-400" />
              <input
                className="h-11 w-full border-0 bg-transparent text-sm outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
              />
            </span>
          </label>

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
