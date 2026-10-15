"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { api, errorDetail, formatError, setToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PrivateBiographyAccess({ codeLabel }: { codeLabel: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<{ token: string }>("/auth/character", { code });
      setToken(data.token);
      router.push("/dossier");
    } catch (reason) {
      setError(formatError(errorDetail(reason)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="mt-6 h-auto w-full gap-2 whitespace-normal py-3" data-testid="private-biography-button"><KeyRound className="h-4 w-4 shrink-0" /> Accéder à ma bio privée</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-brass/30 bg-noir-paper text-parch" aria-describedby="private-access-description">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Votre dossier privé</DialogTitle></DialogHeader>
          <p id="private-access-description" className="text-sm text-parch/70">Votre code personnel ouvre uniquement le dossier qui vous est attribué.</p>
          <form onSubmit={submit} className="space-y-4">
            <label htmlFor="character-code" className="block text-sm text-brass">{codeLabel}</label>
            <Input id="character-code" data-testid="character-code-input" autoComplete="off" required maxLength={12} value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="XXXXXX" className="text-center font-mono text-xl tracking-widest" />
            {error && <p role="alert" className="text-red-300">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Vérification…" : "Ouvrir mon dossier"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
