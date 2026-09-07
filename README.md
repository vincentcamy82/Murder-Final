# Murder Party 1900 — webapp

Réécriture Next.js (App Router, TypeScript) du site : frontend + API dans une seule app, déployable sur le plan gratuit de Vercel.

## Développement local

```bash
npm ci
npm run dev          # http://localhost:3000
npm run typecheck
npm run build
```

`.env.local` doit fournir `MONGO_URL`/`DB_NAME` (cluster Atlas, voir [SETUP-MONGODB.md](./SETUP-MONGODB.md)) ainsi que `ADMIN_PASSWORD` et `JWT_SECRET`. Les médias sont enregistrés dans la même base MongoDB, en local comme en production.

## Déploiement sur Vercel (gratuit)

1. Importer le repo, **Root Directory = `webapp`**.
2. Variables d'environnement : `MONGO_URL`, `DB_NAME`, `ADMIN_PASSWORD`, `JWT_SECRET` — guide détaillé dans [SETUP-MONGODB.md](./SETUP-MONGODB.md).
3. Utiliser le plan **Free / M0** de MongoDB Atlas : les images sont stockées dans la collection `media_files`. Aucun store Blob ni token de stockage supplémentaire n’est nécessaire.

Le stockage reste gratuit avec MongoDB Atlas Free / M0 et Vercel Hobby, dans leurs quotas. MongoDB fournit [512 Mo partagés entre les données, les images et les index](https://www.mongodb.com/pricing). Le quota n’augmente pas automatiquement : lorsqu’il est plein, il faut supprimer des médias. La suppression d’une image et le remplacement du fond libèrent les fichiers correspondants dans MongoDB.

## Musique d’accueil

La musique est extraite du fichier « Musique accueil_ » fourni pour le site. Elle démarre automatiquement en boucle à l’ouverture de l’accueil. Si le navigateur bloque la lecture automatique, elle démarre au premier clic ou à la première touche. Le bouton « Couper la musique » la met en pause et « Écouter l’ambiance » la relance. Pour la remplacer, remplacer `public/audio/ambiance.mp3` par le fichier MP3 souhaité.

## Limites connues

- Les photos et fonds volumineux sont réduits dans le navigateur avant l’envoi (JPEG de 1 Mo maximum, côté le plus long de 1 920 pixels). Les images déjà inférieures à 1 Mo sont conservées. Formats acceptés : JPEG, PNG, WebP et GIF ; exporter les fichiers HEIC en JPEG.
- Les anciens fichiers locaux et anciennes URL Blob restent lisibles. Les nouveaux envois utilisent uniquement MongoDB.
- Les fichiers sont limités à 4 Mo côté serveur, dont 1 Mo pour les images. Pour les vidéos, utiliser les liens YouTube/Vimeo déjà supportés afin de préserver le stockage gratuit.
- Le mot de passe admin est comparé directement à `ADMIN_PASSWORD` (pas de hash stocké en base, inutile puisque la valeur vit déjà dans l'env).
