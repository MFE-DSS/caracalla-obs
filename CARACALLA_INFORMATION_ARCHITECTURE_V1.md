# CARACALLA — Information Architecture V1
## Sprint UX_00 — Structure des écrans et navigation

---

## 1. Vue d'ensemble du flow

```
Landing → Audit (steps 1..n) → Synthèse gratuite → Paywall → Rapport premium → Upsell conseil
                ↑                                                        |
                └── Save & resume ──────────────────────────────────────┘
```

Le flow est **linéaire avec retour possible**. L'utilisateur avance étape par étape. Il peut sauvegarder et reprendre. Il ne navigue pas librement dans un menu — il progresse dans une lecture.

---

## 2. Inventaire des écrans

| # | Écran | URL pattern | Accès | Rôle |
|---|-------|------------|-------|------|
| 1 | Landing | `/` | Public | Promettre et convertir vers l'audit |
| 2 | Audit — étapes | `/audit/:step` | Public | Collecter les données de l'entreprise |
| 3 | Synthèse gratuite | `/synthese` | Post-audit | Restituer le diagnostic de base |
| 4 | Paywall | `/rapport/upgrade` | Post-synthèse | Vendre le rapport premium |
| 5 | Rapport premium | `/rapport` | Post-paiement | Délivrer le dossier de décision complet |
| 6 | Upsell conseil | `/conseil` | Post-rapport | Proposer l'accompagnement |
| 7 | Checkout | `/checkout` | Depuis paywall | Paiement Stripe |

---

## 3. Structure détaillée par écran

### 3.1 Landing (`/`)

**Objectif** : Faire comprendre la promesse en moins de 8 secondes, puis convertir vers l'audit.

| Ordre | Zone | Contenu | Priorité |
|-------|------|---------|----------|
| 1 | Hero | Titre promesse + sous-titre contexte + CTA principal | Critique |
| 2 | Pain statement | 3-4 douleurs concrètes de dirigeant PME | Critique |
| 3 | What you get | Ce que l'audit gratuit produit concrètement | Critique |
| 4 | How it works | 3 étapes visuelles : audit → synthèse → rapport | Important |
| 5 | Trust block | Explicabilité : comment ça marche, pas de boîte noire | Important |
| 6 | CTA secondaire | Rappel du CTA avec ancrage de gratuité | Important |
| 7 | FAQ courte | 4-6 questions fréquentes | Optionnel |
| 8 | Footer | Mentions, contact, légal | Standard |

**Règles** :
- Pas de carrousel.
- Pas de vidéo en autoplay.
- Le hero doit fonctionner seul si l'utilisateur ne scrolle pas.
- Le CTA doit être visible sans scroll sur mobile.

---

### 3.2 Audit — Étapes (`/audit/:step`)

**Objectif** : Collecter les informations de manière guidée, non intimidante, avec feedback progressif.

| Ordre | Zone | Contenu | Priorité |
|-------|------|---------|----------|
| 1 | Progress header | Stepper + numéro d'étape + titre | Critique |
| 2 | Step title | Titre de la section en cours | Critique |
| 3 | Form area | 2-4 champs par étape maximum | Critique |
| 4 | Hints / examples | Aide contextuelle sous les champs | Important |
| 5 | Context rail (desktop) | Résumé de ce qui a été rempli — visible uniquement desktop | Desktop only |
| 6 | Navigation | Boutons précédent / suivant / sauvegarder | Critique |
| 7 | Micro-feedback | Message de progression ("Étape 3/7 — votre carte se construit") | Important |

**Étapes recommandées** :

| Step | Thème | Champs types |
|------|-------|-------------|
| 1 | Identité entreprise | Secteur, taille, ancienneté, rôle du répondant |
| 2 | Activité commerciale | Volume devis/commandes, délais, outils utilisés |
| 3 | Production / livraison | Process de production, suivi, sous-traitance |
| 4 | Administration | Facturation, relances, comptabilité, outils |
| 5 | Ressources humaines | Effectif, turnover, process RH, outils |
| 6 | Pilotage | Tableaux de bord, indicateurs, fréquence de revue |
| 7 | Douleurs ressenties | Top 3 frustrations, temps perdu estimé, priorités |

**Règles** :
- Maximum 4 champs par étape.
- Chaque champ a un label métier + un exemple concret.
- Le bouton "Suivant" est désactivé tant que les champs requis ne sont pas remplis.
- Sauvegarde automatique à chaque étape complétée.
- Possibilité de revenir en arrière sans perdre de données.

---

### 3.3 Synthèse gratuite (`/synthese`)

**Objectif** : Montrer que le système a compris l'entreprise et donner un premier diagnostic utile.

| Ordre | Zone | Contenu | Priorité |
|-------|------|---------|----------|
| 1 | Executive snapshot | Résumé en 2-3 phrases de l'entreprise telle que comprise | Critique |
| 2 | Profil détecté | Archétype ou profil opérationnel identifié | Critique |
| 3 | Frictions dominantes | 3-5 frictions principales avec score et explication | Critique |
| 4 | Opportunity teaser | 1 opportunité prioritaire détaillée | Critique |
| 5 | Limites / confiance | Ce que le système n'a pas pu évaluer | Important |
| 6 | CTA premium | "Pour aller plus loin : le rapport complet" | Critique |

**Règles** :
- Le snapshot doit reprendre des éléments concrets saisis par l'utilisateur (secteur, taille, douleurs).
- Les frictions sont classées par impact estimé.
- L'opportunity teaser donne assez de détail pour être utile, mais laisse entrevoir la profondeur du premium.
- Le bloc limites/confiance est affiché si et seulement si des données sont insuffisantes.

---

### 3.4 Paywall (`/rapport/upgrade`)

**Objectif** : Faire comprendre la valeur du rapport premium comme outil de décision, pas comme simple "suite".

| Ordre | Zone | Contenu | Priorité |
|-------|------|---------|----------|
| 1 | Rappel synthèse | Résumé du diagnostic gratuit (2 lignes) | Important |
| 2 | Ce que le rapport contient | Liste structurée des sections premium | Critique |
| 3 | Comparaison gratuit/premium | Tableau simple : ce que vous avez / ce que vous obtenez | Critique |
| 4 | Valeur concrète | "Vous pourrez décider de X, prioriser Y, lancer Z" | Critique |
| 5 | Prix + CTA | Prix clair, CTA unique, garantie éventuelle | Critique |
| 6 | FAQ paiement | 2-3 questions sur le paiement et le livrable | Optionnel |

**Règles** :
- Pas de compte à rebours factice.
- Pas de "offre limitée" artificielle.
- Le prix est affiché clairement, pas caché derrière un bouton.
- La comparaison gratuit/premium est factuelle, pas manipulatrice.

---

### 3.5 Rapport premium (`/rapport`)

**Objectif** : Délivrer un dossier de décision complet, lisible et actionnable.

| Ordre | Zone | Contenu | Priorité |
|-------|------|---------|----------|
| 1 | Executive verdict | Synthèse décisionnelle en 3-5 phrases | Critique |
| 2 | Score global | Score de maturité opérationnelle avec explication | Critique |
| 3 | Opportunités classées | Liste ordonnée par priorité avec détail par carte | Critique |
| 4 | Détail par opportunité | Friction, impact, faisabilité, risque, evidence | Critique |
| 5 | Prérequis transverses | Ce qui doit être en place avant tout projet | Important |
| 6 | Risques identifiés | Risques majeurs avec mitigation suggérée | Important |
| 7 | Plan pilote recommandé | 1 POC recommandé avec périmètre, durée, coût estimé | Critique |
| 8 | CTA conseil | "Besoin d'aide pour exécuter ? Parlons-en" | Important |
| 9 | Export / partage | Télécharger PDF, partager lien | Optionnel |

**Règles** :
- Le verdict est lisible en 30 secondes.
- Les opportunités sont classées : la première est la plus impactante et faisable.
- Chaque opportunité montre son raisonnement (pourquoi elle remonte).
- Le plan pilote est concret : pas "il faudrait envisager de…" mais "Lancez X sur le périmètre Y pendant Z semaines".

---

### 3.6 Upsell conseil (`/conseil`)

**Objectif** : Convertir la connaissance acquise en demande d'accompagnement.

| Ordre | Zone | Contenu | Priorité |
|-------|------|---------|----------|
| 1 | Rappel rapport | Ce qui a été identifié + le pilote recommandé | Important |
| 2 | Ce que le conseil apporte | Cadrage, exécution, suivi — en termes concrets | Critique |
| 3 | Format prestation | Durée, modalités, livrables | Critique |
| 4 | CTA contact | Formulaire simple ou prise de rendez-vous | Critique |

---

## 4. Logique de navigation

### 4.1 Navigation principale
- **Pas de sidebar**. Le flow est linéaire.
- **Pas de menu burger** sauf pour accès secondaire (compte, aide).
- Navigation par **progression forward** : chaque écran mène au suivant.
- Retour arrière possible via bouton explicite, pas via browser back uniquement.

### 4.2 Navigation secondaire (post-rapport)
Une fois le rapport premium débloqué, l'utilisateur peut :
- Revenir à la synthèse.
- Naviguer entre les sections du rapport.
- Accéder au conseil.

Cette navigation secondaire apparaît **uniquement après le paiement**, sous forme de tabs ou d'ancres dans le rapport.

### 4.3 États de session
| État | Écrans accessibles |
|------|-------------------|
| Anonyme | Landing |
| Audit en cours | Landing, Audit (reprise) |
| Audit complété | Landing, Synthèse |
| Premium acheté | Landing, Synthèse, Rapport, Conseil |

---

## 5. Règles d'orientation

### 5.1 Breadcrumb
Pas de breadcrumb classique. Remplacé par le **stepper** dans l'audit et par le **contexte d'écran** (titre + sous-titre) dans les autres pages.

### 5.2 Indication de position
L'utilisateur doit toujours savoir :
- Où il est (titre d'écran visible).
- D'où il vient (lien retour explicite).
- Où il va (CTA clair vers l'étape suivante).

### 5.3 Récupération de session
- Si un utilisateur revient avec un audit partiel → reprise à la dernière étape complétée.
- Si un utilisateur revient avec un audit complété → accès direct à la synthèse.
- Si un utilisateur revient avec un rapport acheté → accès direct au rapport.

---

## 6. Hiérarchie de l'information

### Règle générale
Sur chaque écran, l'information est organisée en 3 niveaux :

1. **Niveau 1 — Essentiel** : visible immédiatement, sans scroll. Répond à "qu'est-ce que je vois ?".
2. **Niveau 2 — Détail** : accessible en scrollant. Répond à "comment lire ce que je vois ?".
3. **Niveau 3 — Profondeur** : accessible par expansion ou navigation. Répond à "pourquoi c'est comme ça ?".

### Application par écran

| Écran | Niveau 1 | Niveau 2 | Niveau 3 |
|-------|----------|----------|----------|
| Landing | Hero + CTA | Pain + what you get | How it works + FAQ |
| Audit | Progress + champs | Hints + examples | Context rail |
| Synthèse | Snapshot + frictions | Archétype + teaser | Limites + confiance |
| Paywall | Valeur + prix + CTA | Comparaison | FAQ paiement |
| Rapport | Verdict + score + top opportunité | Opportunités 2-n + prérequis | Détail evidence + risques |
| Conseil | Offre + CTA | Format + modalités | — |
