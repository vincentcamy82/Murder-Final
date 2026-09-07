"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, errorDetail, formatError } from "@/lib/api";
import type { Character } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AddGuestDialog({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (guest: Character) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !name.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post<Character>("/admin/characters", { name });
      onCreated(data);
      toast.success("Invité ajouté, son code d’accès est prêt");
    } catch (error) {
      toast.error(formatError(errorDetail(error)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => { if (!saving) onClose(); }}>
      <DialogContent className="border-white/10 bg-noir-paper text-parch" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Ajouter un invité</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <label htmlFor="guest-name" className="block text-sm text-brass">Nom de l’invité</label>
          <Input id="guest-name" value={name} onChange={(event) => setName(event.target.value)} required autoFocus disabled={saving} className="border-white/20 bg-transparent" />
          <p className="text-sm text-parch/60">Un code d’accès personnel sera créé. Vous pourrez ensuite compléter sa fiche et ses photos.</p>
          <Button type="submit" disabled={saving || !name.trim()} className="w-full bg-brass text-black hover:bg-brass/90">
            {saving ? "Création…" : "Créer l’invité"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
