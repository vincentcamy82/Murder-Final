"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, formatError, errorDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ShieldQuestion, ArrowLeft } from "lucide-react";

const BG = "https://images.pexels.com/photos/7319084/pexels-photo-7319084.jpeg?auto=compress&cs=tinysrgb&w=1920";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/admin", { password });
      setToken(data.token);
      router.push("/admin");
    } catch (err) {
      setError(formatError(errorDetail(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir-950 px-6 grain">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${BG})` }} />
      <div className="absolute inset-0 vignette" />

      <form
        onSubmit={submit}
        className="animate-fade-in relative z-10 w-full max-w-md rounded-md border border-white/10 bg-noir-paper/90 p-10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      >
        <div className="mb-8 text-center">
          <ShieldQuestion className="mx-auto h-8 w-8 text-brass" />
          <h1 className="mt-4 font-serif text-3xl font-light text-parch">Espace Organisateur</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-parch/40">Accès réservé</p>
        </div>

        <label className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-brass">Mot de passe</label>
        <input
          data-testid="admin-password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-none border-b-2 border-white/20 bg-transparent px-2 py-2 font-mono text-lg text-parch focus:border-brass focus:outline-none"
        />
        {error && <p data-testid="admin-error" className="mt-4 font-mono text-sm text-red-400">{error}</p>}

        <Button
          data-testid="admin-login-btn"
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-none bg-brass py-6 font-mono text-xs uppercase tracking-[0.25em] text-black hover:bg-brass/90"
        >
          {loading ? "Vérification..." : "Entrer"}
        </Button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 flex w-full items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-parch/40 hover:text-brass"
        >
          <ArrowLeft className="h-3 w-3" /> Retour à l&apos;accueil
        </button>
      </form>
    </div>
  );
}
