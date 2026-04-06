# CARACALLA — UX Principles V1
## Sprint UX_00 — Fondations UX

---

## 1. Thèse UX

Caracalla n'est pas un dashboard. C'est une **interface de lecture progressive de la réalité opérationnelle** d'une entreprise.

Chaque écran doit faire monter l'utilisateur en compréhension, en confiance et en capacité de décision. L'interface ne montre pas des données : elle raconte une histoire factuelle orientée vers l'action.

Le produit s'adresse à des dirigeants de TPE/PME qui :
- n'ont pas de direction technique,
- n'ont pas le temps de lire un rapport de 40 pages,
- ont besoin de comprendre avant de décider,
- veulent du concret, pas du jargon.

---

## 2. Objectifs cognitifs par étape

| Étape | Objectif cognitif | Sensation visée |
|-------|-------------------|-----------------|
| Landing | Comprendre la promesse en 8 secondes | "C'est pour moi" |
| Audit step 1 | Entrer sans effort | "Je peux commencer maintenant" |
| Audit step n | Sentir la progression | "Le système compose ma carte" |
| Synthèse gratuite | Être reconnu | "Il a compris mon entreprise" |
| Paywall | Percevoir la valeur manquante | "Le rapport complet me fera gagner du temps" |
| Rapport premium | Pouvoir agir | "Je sais quoi faire et par où commencer" |
| Upsell conseil | Vouloir être accompagné | "J'ai la matière, je veux l'exécution" |

---

## 3. Principes directeurs

### P1 — Lecture progressive, pas dump de données
L'information est révélée par couches successives. Chaque écran prépare le suivant. Aucun écran ne submerge l'utilisateur.

### P2 — Langage métier, pas jargon technique
On parle de "temps perdu sur les devis", pas de "friction processuelle dans le pipeline commercial". Le vocabulaire doit être celui du dirigeant, pas du consultant ni de l'ingénieur.

### P3 — Explicabilité native
Chaque score, chaque opportunité, chaque recommandation doit dire **pourquoi**. Un score sans explication est un score sans crédibilité.

### P4 — Confiance par la transparence
Le système montre ce qu'il a vu, ce qu'il n'a pas vu, et ce qu'il ne peut pas conclure. Les limites sont affichées, pas cachées.

### P5 — Densité adaptée au contexte
Mobile = narration séquentielle. Desktop = cockpit de décision. La densité d'information s'adapte au device, pas juste la taille des blocs.

### P6 — Chaque écran a un seul job
Un écran ne doit pas essayer de tout montrer. Chaque écran a un objectif cognitif unique (cf. section 2). Si un écran essaie de faire deux choses, il faut le scinder.

### P7 — Le gratuit doit créer de la valeur réelle
La synthèse gratuite ne doit pas être un teaser vide. Elle doit produire une vraie compréhension partielle. C'est cette valeur réelle qui rend le premium désirable.

### P8 — Le paywall vend de la profondeur, pas du déverrouillage
Le paywall ne dit pas "payez pour voir la suite". Il dit "voici ce que le rapport complet vous permettra de décider que vous ne pouvez pas décider aujourd'hui".

### P9 — L'action est toujours le dernier mot
Chaque écran se termine par une action claire : continuer, voir plus, payer, contacter. Jamais de cul-de-sac informationnel.

### P10 — Instrumentation dès le jour 1
Chaque interaction significative est tracée. Pas pour surveiller l'utilisateur, mais pour comprendre où la valeur est perçue et où elle est perdue.

---

## 4. Anti-patterns à éviter

| Anti-pattern | Pourquoi c'est un problème | Alternative |
|-------------|---------------------------|-------------|
| Dashboard générique avec KPI abstraits | Le dirigeant PME ne sait pas quoi en faire | Cartographie orientée décision |
| Formulaire administratif long | Abandon massif | Audit guidé en étapes courtes avec feedback |
| Score sans explication | Perte de crédibilité immédiate | Score + phrase explicative + evidence |
| Paywall brutal "contenu bloqué" | Impression d'arnaque | Paywall qui montre la valeur manquante |
| Jargon IA ("notre algorithme propriétaire") | Méfiance, distance | Vocabulaire métier concret |
| Tooltip pour information critique | Invisible sur mobile, ignoré sur desktop | Texte inline ou bloc dédié |
| Tableau complexe sur mobile | Illisible, frustrant | Cards empilées avec tri |
| Hover-dependent interactions | Inaccessible sur tactile | Actions visibles par défaut |
| Template SaaS avec sidebar + topbar | Ressemble à tous les autres SaaS | Layout narratif progressif |
| Promesses magiques ("l'IA va transformer votre entreprise") | Perte de crédibilité | Formulations concrètes et vérifiables |

---

## 5. Règles de confiance produit

### 5.1 Crédibilité du diagnostic
- Chaque friction identifiée cite la source (réponse audit, pattern détecté).
- Les scores affichent leur logique de calcul en langage simple.
- Les opportunités montrent le raisonnement : friction → impact → faisabilité → priorité.

### 5.2 Honnêteté sur les limites
- Si une section manque de données, le système le dit explicitement.
- Le niveau de confiance est affiché quand il est bas.
- Le rapport ne prétend pas remplacer un diagnostic humain complet.

### 5.3 Cohérence perçue
- Le vocabulaire est constant d'un écran à l'autre (même friction = même nom partout).
- Les scores utilisent la même échelle partout.
- Les couleurs sémantiques sont consistantes (vert = positif, rouge = bloquant, orange = attention).

### 5.4 Respect de l'utilisateur
- Pas de dark patterns (urgence artificielle, compteurs factices).
- Pas de données collectées sans raison visible.
- Le gratuit est réellement utile, pas un leurre.

---

## 6. Hiérarchie de valeur perçue

Le produit doit construire la valeur perçue dans cet ordre :

1. **Compréhension** — "Il a compris ma situation"
2. **Diagnostic** — "Il a identifié mes vrais problèmes"
3. **Priorisation** — "Il me dit par où commencer"
4. **Plan d'action** — "Il me donne les étapes concrètes"
5. **Accompagnement** — "Il peut m'aider à exécuter"

Chaque couche renforce la suivante. Sauter une couche brise la confiance.

---

## 7. Règle d'or

> **Si un dirigeant de PME de 15 personnes, sans directeur technique, ne comprend pas ce qu'il voit en 5 secondes sur chaque écran, c'est que l'écran a échoué.**

Tout le design, le wording et l'architecture d'information doivent être testés contre cette règle.
