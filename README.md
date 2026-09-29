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

## Biographies, teasers et ambiance

Les portraits de l’accueil ouvrent les biographies publiques (`/biographies/[id]`). Dans l’espace organisateur, chaque fiche dispose d’un champ **Biographie publique** distinct du récit privé existant. Ce nouveau champ est vide par défaut : aucun secret existant n’est publié. Le bouton **Accéder à ma bio privée** ouvre la saisie du code personnel et donne accès au dossier attribué à ce code.

L’onglet **Vidéos** de l’espace organisateur permet d’ajouter, réordonner et retirer les teasers (titre et lien HTTPS YouTube, Vimeo ou fichier MP4 hébergé). Cliquer sur **Enregistrer les vidéos** les publie sur l’accueil, `/videos` et l’onglet Vidéos de toutes les biographies. Les vidéos privées des dossiers restent réservées à leurs joueurs.

L’onglet **Apparence du site** propose un fond pour l’accueil et un fond indépendant pour toutes les biographies, publiques et privées. Chaque fond accepte une image téléversée ou une URL. Le fond des biographies peut être retiré. Les sauvegardes de fond sont immédiates et préservent les modifications de texte en cours.

L’accueil garde sa musique d’origine (`public/audio/ambiance.mp3`). Les biographies publiques et le dossier privé jouent leur propre musique, extraite du fichier « Musique .mp4 » fourni (`public/audio/biographie.mp3`, environ 31 secondes). Chaque piste tente de démarrer automatiquement en boucle à l’arrivée sur sa page ; si le navigateur bloque le son automatique, elle démarre au premier clic ou à la première touche, ou via **Écouter l’ambiance**. **Couper la musique** la met en pause. Les autres pages (`/videos`, espace organisateur) n’ont pas de musique. Pour changer une piste, remplacer le fichier MP3 correspondant.

Les ajouts aux contrats sont compatibles avec les documents MongoDB existants : `public_story` sur les personnages, `teasers` et `biography_background_*` dans les paramètres du site, avec des valeurs vides par défaut. Le nouvel endpoint public `/api/characters/public/[id]` ne renvoie ni récit privé, ni code, ni liste de médias privés.

## Limites connues

- Les photos et fonds volumineux sont réduits dans le navigateur avant l’envoi (JPEG de 1 Mo maximum, côté le plus long de 1 920 pixels). Les images déjà inférieures à 1 Mo sont conservées. Formats acceptés : JPEG, PNG, WebP et GIF ; exporter les fichiers HEIC en JPEG.
- Les anciens fichiers locaux et anciennes URL Blob restent lisibles. Les nouveaux envois utilisent uniquement MongoDB.
- Les fichiers sont limités à 4 Mo côté serveur, dont 1 Mo pour les images. Pour les vidéos, utiliser les liens YouTube/Vimeo déjà supportés afin de préserver le stockage gratuit.
- Le mot de passe admin est comparé directement à `ADMIN_PASSWORD` (pas de hash stocké en base, inutile puisque la valeur vit déjà dans l'env).
