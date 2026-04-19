# DEMOEMA Signup Automator

Container isolé VPS qui automatise la création de comptes API sur portails publics FR gratuits pour débloquer les sources bloquées par auth.

## Isolation sécuritaire (non négociable)

- Container Docker **read-only**, `cap_drop: ALL`, `no-new-privileges`
- Network isolé (`signup-net`, pas de shared-supabase)
- Volumes minimaux : `profile.yaml:ro`, `.env.signups:rw`, `audit:rw`
- User non-root (`pwuser` de l'image Playwright)
- **Aucun accès** : Gmail perso, banking, filesystem host, secrets des autres services
- Audit trail complet (screenshots par étape, chiffrés pour le password)

## Services supportés

| Source | Flow | Automatisable | Note |
|---|---|---|---|
| INSEE SIRENE V3 | ✅ MVP | Oui (form simple) | Priorité 1 |
| INPI RNE | À implémenter | Oui | Priorité 2 |
| PISTE (Judilibre + Légifrance) | À implémenter | Oui (gouv FR) | Priorité 2 |
| France Travail | À implémenter | Oui | Priorité 3 |
| EPO OPS | À implémenter | Oui | Priorité 4 |
| GitHub | ❌ Manual | Non (ToS + 2FA) | À faire manuellement |
| Companies House UK | ❌ Manual | Non (reCAPTCHA + vérif postale) | À faire manuellement |

## Setup initial (1 fois, ~15 min)

### 1. Email dédié projet (choisir Option C recommandée)

**Option A — ProtonMail free** (2 min)
- Créer `demoema@proton.me` sur https://proton.me
- Générer app password pour IMAP
- Renseigner dans `profile.yaml` : `project_email`, `project_email_imap_host=imap.proton.me`, `project_email_user`, + password dans `.env.signups`

**Option B — SimpleLogin alias → forward vers ta boîte** (1 min)
- https://simplelogin.io, créer alias `demoema-signups.xyz@slmail.me`
- L'agent ne peut PAS lire — tu copies manuellement les liens de vérif
- Mode "semi-auto"

**Option C — Postfix VPS** (30 min setup, 100% isolé)
- Install postfix + dovecot sur VPS
- MX record DNS pour `demoema.fr`
- Boîte `signups@demoema.fr` lisible depuis container via `imap://localhost:143`
- Voir `docs/POSTFIX_SETUP.md` pour guide détaillé

### 2. Compléter profile.yaml

```bash
cp profile.yaml.example profile.yaml
nano profile.yaml  # remplir company_name, contact_*, project_email
```

### 3. Init .env.signups vide

```bash
touch .env.signups && chmod 600 .env.signups
```

### 4. Build + run

```bash
docker compose -f docker-compose.signup.yml build
docker compose -f docker-compose.signup.yml run --rm signup-agent
```

## Comportement en cas d'échec partiel

| Cas | Action agent | Action toi |
|---|---|---|
| CAPTCHA détecté | Screenshot + stop + notif Slack | Clic manuel dans form (session partagée OU recommencer sans automation) |
| CGU checkbox required | STOP (ne coche JAMAIS auto) | Cocher CGU + submit manuellement |
| Email verification non reçu 15min | STOP + notif | Vérifier boîte mail, transférer lien à agent |
| 2FA / SMS required | STOP | Fallback manuel complet |
| Form inconnu (UI changée) | Screenshot + stop | Update flow Python ou fallback manuel |

## Audit trail

Après chaque run, structure dans `audit/<source>/<timestamp>/` :
- Screenshots étape par étape
- `password.txt` (chmod 600, pour login manuel si besoin continuer)
- `summary.json` (timestamps + status par étape)

Les credentials extraits sont écrits dans `.env.signups` (jamais en clair dans audit).

## Intégration au pipeline DEMOEMA

Une fois creds obtenus dans `.env.signups`, à appliquer au container principal :

```bash
# Merge .env.signups dans .env principal
cat .env.signups >> /root/DEMOEMA-agents/.env
# Restart agents-platform pour prendre en compte
docker compose -f /root/DEMOEMA-agents/docker-compose.agents.yml restart agents-platform
# Déclencher ingestion des sources débloquées
curl -X POST -H "X-API-Key: $KEY" http://127.0.0.1:8100/ingestion/run/insee_sirene_v3
```

## Limites connues

- **Sélecteurs CSS hardcodés** par flow : si INSEE/INPI/etc. refont leur UI, le flow casse. Le maintainer cron peut detecter (screenshots `99_*` dans audit) et notifier.
- **Pas de CAPTCHA bypass** : le flow STOP et escalade. Pas de tentative contourner (ToS + ethical).
- **Single-shot par source** : chaque source signup-ée 1 fois. Idempotence via check `.env.signups` avant lancement.

## Pas déployé tant que

- [ ] Email dédié projet configuré (Option A/B/C au choix)
- [ ] `profile.yaml` rempli avec infos corporate projet (pas données perso)
- [ ] Founder a validé le flow sur 1 source test avant batch
