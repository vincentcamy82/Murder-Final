# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Site « Murder Party 1900 » : Next.js 15 (App Router, TypeScript, React 19), frontend + API dans une seule app, déployée sur le plan gratuit de Vercel. Toute l'interface et les messages d'erreur API sont en français.

## Commandes

```bash
yarn install
yarn dev          # http://localhost:3000
yarn typecheck    # tsc --noEmit
yarn build
```

Package manager : **yarn** (yarn.lock). Pas de lint script, pas de tests — la vérification passe par `yarn typecheck` + `yarn build` et l'exécution réelle.

`.env.local` requis en local : `MONGO_URL` (alias acceptés : `MONGODB_URI`, `MONGO_URI`, `DB_URI`), `DB_NAME`, `ADMIN_PASSWORD`, `JWT_SECRET`. Voir `SETUP-MONGODB.md`.

## Architecture

Trois surfaces frontend (grosses pages client — `"use client"`) :

- `/` (`src/app/page.tsx`) : accueil public — contenu éditable du site, compte à rebours, liste des convives, login par code d'accès joueur.
- `/dossier` : dossier du personnage du joueur connecté.
- `/admin` + `/admin/login` : interface organisateur (CRUD personnages, médias, contenu du site).

### API (`src/app/api/**`)

Chaque route handler est enveloppé dans `handler()` de `src/lib/server/http.ts` et signale les erreurs en jetant `ApiError(status, detail)` — la réponse d'erreur est toujours `{detail}` (format hérité du backend FastAPI d'origine, attendu par `formatError` côté client). Suivre ce pattern pour toute nouvelle route.

Séparation stricte client/serveur :
- `src/lib/server/` : code serveur uniquement (db, data, auth, storage, http).
- `src/lib/` : helpers utilisables côté client (`api.ts`, `media.ts`, `site.ts`, `utils.ts`).
- `src/types.ts` : types partagés client/serveur (`Character`, `MediaItem`, `SiteContent`…).

### Auth (`src/lib/server/auth.ts`)

JWT HS256 (jose), payload `Identity { role: "admin" | "player", character_id? }`.
- Côté client : token dans `localStorage` (`mp_token`), envoyé en `Authorization: Bearer` par l'intercepteur axios de `src/lib/api.ts`.
- Les médias passent le token en query param `?token=` (`fileUrl()`), car `<img>`/`<video>` ne peuvent pas envoyer de header.
- Routes admin : `requireAdmin(request)`. Le mot de passe admin est comparé directement à `ADMIN_PASSWORD` (pas de hash en base, choix assumé).
- Login joueur : code d'accès à 6 caractères (`access_code`), insensible à la casse.

### Données (`src/lib/server/data.ts` — unique couche d'accès)

MongoDB Atlas via le driver natif (pas d'ODM), client caché au niveau module (`src/lib/server/db.ts`) pour survivre aux invocations serverless. Deux collections, **même schéma que l'ancien backend FastAPI** (ne pas migrer/renommer) :
- `characters` : `id` UUID string (pas `_id`), `name`, `title`, `access_code`, `story`, `media[]`, `order`.
- `settings` : document `{key: "site"}` = contenu éditable de l'accueil, sérialisé via `serializeSite()` avec repli sur `SITE_DEFAULTS` champ par champ.

Auto-seed : au premier appel API, si `characters` est vide, création de 15 personnages avec des codes neufs (`ensureSeed`). Une base déjà peuplée n'est jamais touchée.

### Stockage des médias (`src/lib/server/storage.ts`)

Les nouveaux fichiers vont dans la collection MongoDB `media_files`, en binaire, en local comme en production. Réutiliser le plan Atlas Free / M0 prévu pour ce site : les 512 Mo sont partagés avec les données et les index. Aucun service Blob n’est nécessaire. Voir [SETUP-MONGODB.md](./SETUP-MONGODB.md) pour les limites et la compatibilité avec les anciens fichiers.

Les références restent dans `characters.media` et `settings`. `/api/files/[...path]` sert les fichiers MongoDB, avec repli sur les anciens fichiers locaux et redirection pour les anciennes `blob_url`. Le premier portrait disponible est public ; les autres médias nécessitent une session admin ou celle du personnage concerné. La suppression d’un média et le remplacement du fond libèrent le fichier MongoDB précédent. Les photos et fonds sont compressés avant l’envoi par `preparePhoto()` ; privilégier les liens YouTube/Vimeo pour les vidéos.

### UI

Composants shadcn-style dans `src/components/ui/` (Radix + class-variance-authority + tailwind-merge), Tailwind CSS 3, icônes lucide-react, toasts sonner. Thème sombre « 1900 » avec polices Google (choix de polices éditable via l'admin, listes dans `src/lib/site.ts`).
