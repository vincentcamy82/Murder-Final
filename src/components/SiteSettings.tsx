"use client";

import { useState } from "react";
import { api, API, formatError, errorDetail } from "@/lib/api";
import { HEADING_FONTS, BODY_FONTS, backgroundUrl } from "@/lib/site";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Save, ImageIcon, LinkIcon } from "lucide-react";
import type { SiteContent } from "@/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-brass">{label}</label>
      {children}
    </div>
  );
}

export default function SiteSettings({
  site,
  setSite,
}: {
  site: SiteContent;
  setSite: (site: SiteContent) => void;
}) {
  const [form, setForm] = useState<SiteContent>(site);
  const [saving, setSaving] = useState(false);
  const [bgUrl, setBgUrl] = useState(site.background_source === "url" ? site.background_url : "");

  const set = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put<SiteContent>("/admin/site", form);
      setSite(data);
      setForm(data);
      toast.success("Apparence enregistrée");
    } catch (err) {
      toast.error(formatError(errorDetail(err)));
    } finally {
      setSaving(false);
    }
  };

  const applyUrl = async () => {
    if (!bgUrl.trim()) return;
    try {
      const { data } = await api.put<SiteContent>("/admin/site", {
        background_source: "url",
        background_url: bgUrl,
      });
      setSite(data);
      setForm(data);
      toast.success("Image de fond mise à jour");
    } catch (err) {
      toast.error(formatError(errorDetail(err)));
    }
  };

  const uploadBg = async (file: File | undefined) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const t = toast.loading("Téléversement…");
    try {
      const { data } = await api.post<SiteContent>("/admin/site/background/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSite(data);
      setForm(data);
      toast.success("Image de fond téléversée", { id: t });
    } catch (err) {
      toast.error(formatError(errorDetail(err)), { id: t });
    }
  };

  const preview = backgroundUrl(form, API);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-md border border-white/10 bg-noir-paper p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <h2 className="mb-5 font-serif text-xl text-parch">Textes de la page d&apos;accueil</h2>
          <div className="space-y-5">
            <Field label="Sur-titre (au-dessus)">
              <Input data-testid="site-eyebrow" value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className="rounded-none border-white/20 bg-transparent" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Titre">
                <Input data-testid="site-title" value={form.title} onChange={(e) => set("title", e.target.value)} className="rounded-none border-white/20 bg-transparent font-serif text-lg" />
              </Field>
              <Field label="Titre (partie dorée)">
                <Input data-testid="site-title-highlight" value={form.title_highlight} onChange={(e) => set("title_highlight", e.target.value)} className="rounded-none border-white/20 bg-transparent font-serif text-lg text-brass" />
              </Field>
            </div>
            <Field label="Histoire / Description">
              <Textarea data-testid="site-story" value={form.story} onChange={(e) => set("story", e.target.value)} rows={4} className="rounded-none border-white/20 bg-transparent" />
            </Field>
            <Field label="Phrase d'accroche (dorée)">
              <Input data-testid="site-story-highlight" value={form.story_highlight} onChange={(e) => set("story_highlight", e.target.value)} className="rounded-none border-white/20 bg-transparent text-brass" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Texte du compte à rebours">
                <Input data-testid="site-cd-label" value={form.countdown_label} onChange={(e) => set("countdown_label", e.target.value)} className="rounded-none border-white/20 bg-transparent" />
              </Field>
              <Field label="Date de l'événement">
                <Input data-testid="site-event-date" type="datetime-local" value={(form.event_date || "").slice(0, 16)} onChange={(e) => set("event_date", e.target.value)} className="rounded-none border-white/20 bg-transparent" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Libellé du champ code">
                <Input data-testid="site-code-label" value={form.code_label} onChange={(e) => set("code_label", e.target.value)} className="rounded-none border-white/20 bg-transparent" />
              </Field>
              <Field label="Libellé liste des invités">
                <Input data-testid="site-guests-label" value={form.guests_label} onChange={(e) => set("guests_label", e.target.value)} className="rounded-none border-white/20 bg-transparent" />
              </Field>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-noir-paper p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <h2 className="mb-5 font-serif text-xl text-parch">Polices</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Police des titres">
              <Select value={form.font_heading} onValueChange={(v) => set("font_heading", v)}>
                <SelectTrigger data-testid="site-font-heading" className="rounded-none border-white/20 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEADING_FONTS.map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: `'${f}', serif` }}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Police du texte">
              <Select value={form.font_body} onValueChange={(v) => set("font_body", v)}>
                <SelectTrigger data-testid="site-font-body" className="rounded-none border-white/20 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BODY_FONTS.map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <p className="mt-4 text-2xl text-parch" style={{ fontFamily: `'${form.font_heading}', serif` }}>
            {form.title} <span className="text-brass">{form.title_highlight}</span>
          </p>
        </div>

        <Button data-testid="site-save" onClick={save} disabled={saving} className="w-full gap-2 rounded-none bg-brass py-6 font-mono text-xs uppercase tracking-[0.25em] text-black hover:bg-brass/90">
          <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="rounded-md border border-white/10 bg-noir-paper p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-parch">
            <ImageIcon className="h-5 w-5 text-brass" /> Image de fond
          </h2>
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-sm border border-white/10 bg-black">
            <img src={preview} alt="aperçu" className="h-full w-full object-cover" data-testid="site-bg-preview" />
          </div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-brass">Téléverser une image</label>
          <input
            id="bg-upload"
            type="file"
            accept="image/*"
            className="hidden"
            data-testid="site-bg-upload-input"
            onChange={(e) => {
              uploadBg(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button data-testid="site-bg-upload-btn" variant="outline" onClick={() => document.getElementById("bg-upload")?.click()} className="w-full gap-2 rounded-none border-white/20 font-mono text-xs uppercase tracking-widest">
            <Upload className="h-4 w-4" /> Choisir un fichier
          </Button>
          <div className="my-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-parch/30">
            <div className="h-px flex-1 bg-white/10" /> ou <div className="h-px flex-1 bg-white/10" />
          </div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-brass">Utiliser une URL</label>
          <Input data-testid="site-bg-url" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="https://…" className="rounded-none border-white/20 bg-transparent font-mono text-xs" />
          <Button data-testid="site-bg-url-btn" onClick={applyUrl} className="mt-3 w-full gap-2 rounded-none bg-brass font-mono text-xs uppercase tracking-widest text-black hover:bg-brass/90">
            <LinkIcon className="h-3.5 w-3.5" /> Appliquer l&apos;URL
          </Button>
        </div>
      </div>
    </div>
  );
}
