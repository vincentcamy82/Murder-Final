"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { api, fileUrl, clearToken, formatError, errorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LogOut, Pencil, RefreshCw, Trash2, Upload, LinkIcon, Copy, Image as ImageIcon, Film, type LucideProps } from "lucide-react";
import SiteSettings from "@/components/SiteSettings";
import { DEFAULT_SITE } from "@/lib/site";
import type { Character, MediaItem, MediaKind, SiteContent } from "@/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Character | null>(null);
  const [site, setSite] = useState<SiteContent>(DEFAULT_SITE);

  const load = useCallback(async () => {
    try {
      const [chars, s] = await Promise.all([
        api.get<Character[]>("/admin/characters"),
        api.get<SiteContent>("/site"),
      ]);
      setCharacters(chars.data);
      setSite({ ...DEFAULT_SITE, ...s.data });
    } catch {
      clearToken();
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = () => {
    clearToken();
    router.push("/admin/login");
  };

  const copyCode = (code: string | undefined) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copié`);
  };

  const onSaved = (updated: Character) => {
    setCharacters((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    setEditing(updated);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950 font-mono text-sm text-brass">
        Chargement…
      </div>
    );

  return (
    <div className="min-h-screen bg-noir-950">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-serif text-2xl font-light text-parch">Régie de la soirée</h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brass">Murder Party · 1900</p>
          </div>
          <Button data-testid="admin-logout-btn" variant="ghost" onClick={logout} className="gap-2 font-mono text-xs uppercase tracking-widest text-parch/60 hover:text-brass">
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="mb-8 h-auto gap-2 rounded-none border-b border-white/10 bg-transparent p-0">
            <TabsTrigger value="characters" data-testid="main-tab-characters" className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 font-mono text-xs uppercase tracking-widest text-parch/50 data-[state=active]:border-brass data-[state=active]:bg-transparent data-[state=active]:text-brass data-[state=active]:shadow-none">
              Personnages
            </TabsTrigger>
            <TabsTrigger value="site" data-testid="main-tab-site" className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 font-mono text-xs uppercase tracking-widest text-parch/50 data-[state=active]:border-brass data-[state=active]:bg-transparent data-[state=active]:text-brass data-[state=active]:shadow-none">
              Apparence du site
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters">
            <div className="rounded-md border border-white/10 bg-noir-paper shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="font-mono text-xs uppercase tracking-widest text-parch/50">Personnage</TableHead>
                    <TableHead className="font-mono text-xs uppercase tracking-widest text-parch/50">Code d&apos;accès</TableHead>
                    <TableHead className="font-mono text-xs uppercase tracking-widest text-parch/50">Récit</TableHead>
                    <TableHead className="font-mono text-xs uppercase tracking-widest text-parch/50">Médias</TableHead>
                    <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-parch/50">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {characters.map((c) => (
                    <TableRow key={c.id} data-testid={`row-${c.id}`} className="border-white/5 hover:bg-white/5">
                      <TableCell>
                        <div className="font-serif text-lg text-parch">{c.name}</div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-parch/40">{c.title}</div>
                      </TableCell>
                      <TableCell>
                        <button
                          data-testid={`copy-code-${c.id}`}
                          onClick={() => copyCode(c.access_code)}
                          className="flex items-center gap-2 font-mono text-brass hover:text-brass/80"
                        >
                          {c.access_code} <Copy className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono text-xs ${c.story ? "text-green-400/80" : "text-parch/30"}`}>
                          {c.story ? "Rédigé" : "Vide"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-parch/60">
                        {c.media.filter((m) => m.kind === "photo").length} photo(s) · {c.media.filter((m) => m.kind === "video").length} vidéo(s)
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          data-testid={`edit-${c.id}`}
                          size="sm"
                          onClick={() => setEditing(c)}
                          className="gap-2 rounded-none bg-brass font-mono text-[11px] uppercase tracking-widest text-black hover:bg-brass/90"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Éditer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="site">
            <SiteSettings site={site} setSite={setSite} />
          </TabsContent>
        </Tabs>
      </main>

      {editing && <EditDialog character={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}
    </div>
  );
}

function EditDialog({
  character,
  onClose,
  onSaved,
}: {
  character: Character;
  onClose: () => void;
  onSaved: (c: Character) => void;
}) {
  const [name, setName] = useState(character.name);
  const [title, setTitle] = useState(character.title || "");
  const [accessCode, setAccessCode] = useState(character.access_code ?? "");
  const [story, setStory] = useState(character.story || "");
  const [saving, setSaving] = useState(false);
  const [linkKind, setLinkKind] = useState<MediaKind>("photo");
  const [linkUrl, setLinkUrl] = useState("");
  const photoInput = useRef<HTMLInputElement | null>(null);
  const videoInput = useRef<HTMLInputElement | null>(null);

  const media = character.media;

  const saveInfo = async () => {
    setSaving(true);
    try {
      const { data } = await api.put<Character>(`/admin/characters/${character.id}`, {
        name,
        title,
        access_code: accessCode,
        story,
      });
      onSaved(data);
      toast.success("Fiche enregistrée");
    } catch (err) {
      toast.error(formatError(errorDetail(err)));
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    try {
      const { data } = await api.post<Character>(`/admin/characters/${character.id}/regenerate-code`);
      setAccessCode(data.access_code ?? "");
      onSaved(data);
      toast.success("Nouveau code généré");
    } catch (err) {
      toast.error(formatError(errorDetail(err)));
    }
  };

  const addLink = async () => {
    if (!linkUrl.trim()) return;
    try {
      const { data } = await api.post<Character>(`/admin/characters/${character.id}/media/link`, {
        kind: linkKind,
        url: linkUrl,
      });
      onSaved(data);
      setLinkUrl("");
      toast.success("Lien ajouté");
    } catch (err) {
      toast.error(formatError(errorDetail(err)));
    }
  };

  const uploadFile = async (kind: MediaKind, file: File | undefined) => {
    if (!file) return;
    const form = new FormData();
    form.append("kind", kind);
    form.append("file", file);
    const t = toast.loading("Téléversement…");
    try {
      const { data } = await api.post<Character>(`/admin/characters/${character.id}/media/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSaved(data);
      toast.success("Fichier ajouté", { id: t });
    } catch (err) {
      toast.error(formatError(errorDetail(err)), { id: t });
    }
  };

  const removeMedia = async (mediaId: string) => {
    try {
      const { data } = await api.delete<Character>(`/admin/characters/${character.id}/media/${mediaId}`);
      onSaved(data);
      toast.success("Média supprimé");
    } catch (err) {
      toast.error(formatError(errorDetail(err)));
    }
  };

  const srcFor = (m: MediaItem) => (m.source === "upload" ? fileUrl(m.storage_path ?? "") : m.url ?? "");
  const photos = media.filter((m) => m.kind === "photo");
  const videos = media.filter((m) => m.kind === "video");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-noir-paper text-parch">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light text-parch">{character.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="grid w-full grid-cols-3 rounded-none bg-noir-surface">
            <TabsTrigger value="info" data-testid="dlg-tab-info" className="rounded-none font-mono text-xs uppercase tracking-widest data-[state=active]:bg-brass data-[state=active]:text-black">Fiche</TabsTrigger>
            <TabsTrigger value="photos" data-testid="dlg-tab-photos" className="rounded-none font-mono text-xs uppercase tracking-widest data-[state=active]:bg-brass data-[state=active]:text-black">Photos</TabsTrigger>
            <TabsTrigger value="videos" data-testid="dlg-tab-videos" className="rounded-none font-mono text-xs uppercase tracking-widest data-[state=active]:bg-brass data-[state=active]:text-black">Vidéos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6 space-y-5">
            <Field label="Nom du personnage">
              <Input data-testid="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-none border-white/20 bg-transparent font-serif text-lg" />
            </Field>
            <Field label="Titre / Rôle">
              <Input data-testid="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-none border-white/20 bg-transparent" />
            </Field>
            <Field label="Code d'accès">
              <div className="flex gap-2">
                <Input data-testid="edit-code" value={accessCode} onChange={(e) => setAccessCode(e.target.value.toUpperCase())} className="rounded-none border-white/20 bg-transparent font-mono tracking-widest text-brass" />
                <Button data-testid="regen-code" variant="outline" onClick={regenerate} className="gap-2 rounded-none border-white/20 font-mono text-xs">
                  <RefreshCw className="h-3.5 w-3.5" /> Générer
                </Button>
              </div>
            </Field>
            <Field label="Récit / Indices du personnage">
              <Textarea data-testid="edit-story" value={story} onChange={(e) => setStory(e.target.value)} rows={10} className="rounded-none border-white/20 bg-transparent font-mono text-sm leading-relaxed" placeholder="Écrivez ici l'histoire secrète, les objectifs et les indices de ce joueur…" />
            </Field>
            <Button data-testid="save-info" onClick={saveInfo} disabled={saving} className="w-full rounded-none bg-brass py-5 font-mono text-xs uppercase tracking-widest text-black hover:bg-brass/90">
              {saving ? "Enregistrement…" : "Enregistrer la fiche"}
            </Button>
          </TabsContent>

          <TabsContent value="photos" className="mt-6 space-y-6">
            <MediaAdder
              kind="photo"
              accept="image/*"
              inputRef={photoInput}
              onUpload={(f) => uploadFile("photo", f)}
              linkUrl={linkKind === "photo" ? linkUrl : ""}
              onLinkChange={(v) => {
                setLinkKind("photo");
                setLinkUrl(v);
              }}
              onAddLink={() => {
                setLinkKind("photo");
                addLink();
              }}
            />
            {photos.length === 0 ? (
              <p className="py-6 text-center font-serif italic text-parch/40">Aucune photo.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((m) => (
                  <div key={m.id} className="group relative overflow-hidden rounded-sm border border-white/10">
                    <img src={srcFor(m)} alt="" className="aspect-square w-full object-cover" />
                    <button data-testid={`del-media-${m.id}`} onClick={() => removeMedia(m.id)} className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-red-400 opacity-0 transition-opacity group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6 space-y-6">
            <MediaAdder
              kind="video"
              accept="video/*"
              inputRef={videoInput}
              onUpload={(f) => uploadFile("video", f)}
              linkUrl={linkKind === "video" ? linkUrl : ""}
              onLinkChange={(v) => {
                setLinkKind("video");
                setLinkUrl(v);
              }}
              onAddLink={() => {
                setLinkKind("video");
                addLink();
              }}
              linkPlaceholder="Lien YouTube, Vimeo ou URL de vidéo"
            />
            {videos.length === 0 ? (
              <p className="py-6 text-center font-serif italic text-parch/40">Aucune vidéo.</p>
            ) : (
              <div className="space-y-3">
                {videos.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-noir-surface p-3">
                    <span className="truncate font-mono text-xs text-parch/70">
                      {m.source === "upload" ? m.filename : m.url}
                    </span>
                    <button data-testid={`del-media-${m.id}`} onClick={() => removeMedia(m.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-brass">{label}</label>
      {children}
    </div>
  );
}

function MediaAdder({
  kind,
  accept,
  inputRef,
  onUpload,
  linkUrl,
  onLinkChange,
  onAddLink,
  linkPlaceholder = "Coller une URL d'image",
}: {
  kind: MediaKind;
  accept: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onUpload: (file: File | undefined) => void;
  linkUrl: string;
  onLinkChange: (value: string) => void;
  onAddLink: () => void;
  linkPlaceholder?: string;
}) {
  const Icon: ComponentType<LucideProps> = kind === "photo" ? ImageIcon : Film;
  return (
    <div className="space-y-4 rounded-md border border-dashed border-white/15 bg-noir-surface/50 p-4">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-parch/50">
        <Icon className="h-4 w-4 text-brass" /> Ajouter un média
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          data-testid={`upload-input-${kind}`}
          onChange={(e) => {
            onUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button data-testid={`upload-btn-${kind}`} variant="outline" onClick={() => inputRef.current?.click()} className="w-full gap-2 rounded-none border-white/20 font-mono text-xs uppercase tracking-widest">
          <Upload className="h-4 w-4" /> Téléverser un fichier
        </Button>
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-parch/30">
        <div className="h-px flex-1 bg-white/10" /> ou <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="flex gap-2">
        <Input
          data-testid={`link-input-${kind}`}
          value={linkUrl}
          onChange={(e) => onLinkChange(e.target.value)}
          placeholder={linkPlaceholder}
          className="rounded-none border-white/20 bg-transparent font-mono text-xs"
        />
        <Button data-testid={`add-link-${kind}`} onClick={onAddLink} className="gap-2 rounded-none bg-brass font-mono text-xs uppercase tracking-widest text-black hover:bg-brass/90">
          <LinkIcon className="h-3.5 w-3.5" /> Ajouter
        </Button>
      </div>
    </div>
  );
}
