"use client";

import { useState } from "react";
import { api, formatError, errorDetail } from "@/lib/api";
import { HEADING_FONTS, BODY_FONTS } from "@/lib/site";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import BackgroundSettings from "@/components/BackgroundSettings";
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

  const set = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put<SiteContent>("/admin/site", {
        eyebrow: form.eyebrow,
        title: form.title,
        title_highlight: form.title_highlight,
        story: form.story,
        story_highlight: form.story_highlight,
        countdown_label: form.countdown_label,
        event_date: form.event_date,
        code_label: form.code_label,
        guests_label: form.guests_label,
        font_heading: form.font_heading,
        font_body: form.font_body,
      });
      setSite(data);
      setForm(data);
      toast.success("Apparence enregistrée");
    } catch (err) {
      toast.error(formatError(errorDetail(err)));
    } finally {
      setSaving(false);
    }
  };

  const backgroundSaved = (updated: SiteContent) => {
    setSite(updated);
    setForm((current) => ({
      ...current,
      background_source: updated.background_source,
      background_url: updated.background_url,
      has_background_upload: updated.has_background_upload,
      biography_background_source: updated.biography_background_source,
      biography_background_url: updated.biography_background_url,
      has_biography_background_upload: updated.has_biography_background_upload,
      updated_at: updated.updated_at,
    }));
  };

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
        <BackgroundSettings target="home" site={form} onSaved={backgroundSaved} />
        <BackgroundSettings target="biography" site={form} onSaved={backgroundSaved} />
      </div>
    </div>
  );
}
