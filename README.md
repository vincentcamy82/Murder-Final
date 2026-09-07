# Murder Party 1900 — webapp

Réécriture Next.js (App Router, TypeScript) du site : frontend + API dans une seule app, déployable sur le plan gratuit de Vercel.

## Développement local

```bash
yarn install
yarn dev          # http://localhost:3000
yarn typecheck
yarn build
```

`.env.local` doit fournir `MONGO_URL`/`DB_NAME` (cluster Atlas, voir [SETUP-MONGODB.md](./SETUP-MONGODB.md)) ainsi que `ADMIN_PASSWORD` et `JWT_SECRET`. Les médias uploadés en local vont dans `.data/storage/` (gitignoré).

## Déploiement sur Vercel (gratuit)

1. Importer le repo, **Root Directory = `webapp`**.
2. Variables d'environnement : `MONGO_URL`, `DB_NAME`, `ADMIN_PASSWORD`, `JWT_SECRET` — guide détaillé dans [SETUP-MONGODB.md](./SETUP-MONGODB.md).
3. Onglet Storage : créer un store **Blob** pour les médias (`BLOB_READ_WRITE_TOKEN` injecté automatiquement).

## Musique d’accueil

La musique est extraite du fichier « Musique accueil_ » fourni pour le site. Elle démarre automatiquement en boucle à l’ouverture de l’accueil. Si le navigateur bloque la lecture automatique, elle démarre au premier clic ou à la première touche. Le bouton « Couper la musique » la met en pause et « Écouter l’ambiance » la relance. Pour la remplacer, remplacer `public/audio/ambiance.mp3` par le fichier MP3 souhaité.

## Limites connues

- Les photos volumineuses sont réduites dans le navigateur avant l’envoi (JPEG de 4 Mo maximum). Formats acceptés : JPEG, PNG, WebP et GIF ; exporter les fichiers HEIC en JPEG.
- Vercel Blob doit être connecté en production : sans `BLOB_READ_WRITE_TOKEN`, l’envoi affiche une erreur de configuration. Le stockage local reste réservé au développement.
- Corps de requête limité à ~4,5 Mo sur Vercel : pour les vidéos, utiliser les liens YouTube/Vimeo (déjà supportés).
- Le mot de passe admin est comparé directement à `ADMIN_PASSWORD` (pas de hash stocké en base, inutile puisque la valeur vit déjà dans l'env).
