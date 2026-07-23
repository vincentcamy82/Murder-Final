# Setup MongoDB (cluster Atlas existant)

L'app utilise directement le cluster MongoDB Atlas qui servait déjà au backend FastAPI d'origine, **avec le même schéma** :

- collection `characters` : un document par personnage (`id` UUID string, `name`, `title`, `access_code`, `story`, `media[]`, `order`) ;
- collection `settings` : le document `{key: "site"}` porte le contenu éditable de la page d'accueil.

Conséquence : les personnages, codes d'accès et récits déjà en base sont repris tels quels — aucune migration. (Le document `{key: "admin"}` de l'ancien backend est ignoré : le mot de passe admin est désormais comparé à la variable d'environnement `ADMIN_PASSWORD`.)

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `MONGO_URL` | Chaîne de connexion `mongodb+srv://…` (alias acceptés : `MONGODB_URI`, `MONGO_URI`, `DB_URI`) |
| `DB_NAME` | Nom de la base (défaut : `test_database`) |
| `ADMIN_PASSWORD` | Mot de passe organisateur (sans lui, le login admin répond 500) |
| `JWT_SECRET` | Signature des sessions |

En local : les renseigner dans `.env.local`. Sur Vercel :

```bash
vercel env add MONGO_URL production
vercel env add DB_NAME production
vercel env add ADMIN_PASSWORD production
vercel env add JWT_SECRET production
```

## Côté Atlas

1. **Network Access** : les fonctions Vercel n'ont pas d'IP fixe → la whitelist doit contenir `0.0.0.0/0` (déjà le cas si le backend d'origine tournait dans le cloud).
2. **Plan M0 gratuit** : suffisant — l'app ouvre une connexion par instance de fonction (client caché au niveau module, voir `src/lib/server/db.ts`), très loin de la limite de 500 connexions.

## Comportement au démarrage

Au premier appel API, si la collection `characters` est **vide**, l'app crée 15 personnages avec des codes d'accès neufs (même seed que l'ancien backend). Sur une base déjà peuplée, rien n'est touché.

## Médias

MongoDB ne stocke que les **références** des médias (`storage_path`, URLs). Les fichiers eux-mêmes vont :

- en production : dans **Vercel Blob** (`BLOB_READ_WRITE_TOKEN` requis — store à créer dans l'onglet Storage du dashboard) ;
- en local : dans `.data/storage/`.

Les fichiers uploadés du temps de l'ancien backend vivaient sur son disque (`backend/storage/`). Pour qu'ils s'affichent en local, copier ce dossier dans `.data/storage/`. En production, les re-uploader via l'admin (ils partiront dans Blob).

## Dépannage

| Symptôme | Cause probable |
| --- | --- |
| 500 « MONGO_URL manquant » | Variable absente de l'environnement |
| Login admin → 500 « ADMIN_PASSWORD non configuré » | Variable absente de l'environnement Vercel |
| Timeout de connexion en production | IP Vercel non autorisée → whitelist Atlas `0.0.0.0/0` |
| 15 personnages inconnus avec de nouveaux codes | `DB_NAME` pointe vers une base vide → le seed s'est déclenché ; vérifier le nom de la base |
| Photos absentes alors qu'elles sont listées dans l'admin | Fichiers de l'ancien backend non re-uploadés (voir « Médias ») |
