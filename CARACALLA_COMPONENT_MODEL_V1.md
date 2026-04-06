# CARACALLA — Component Model V1
## Sprint UX_00 — Composants, props métier et règles d'affichage

---

## 1. Principes du système de composants

- **Orienté métier** : chaque composant porte un sens produit, pas juste une forme visuelle.
- **Minimal** : on ne crée un composant que s'il est utilisé sur au moins 2 écrans ou s'il encapsule une logique métier spécifique.
- **Explicable** : les composants de restitution (scores, opportunités, frictions) intègrent toujours une couche d'explication.
- **Compatible React** : props typées, variants par enum, pas de logique CSS conditionnelle complexe.

---

## 2. Design Tokens

### 2.1 Couleurs principales

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primary` | `#1B2A4A` | Texte principal, headers, actions primaires |
| `--color-primary-light` | `#2D4A7A` | Hover, focus rings |
| `--color-accent` | `#E8913A` | CTA principaux, éléments d'attention |
| `--color-accent-hover` | `#D07E2F` | Hover CTA |
| `--color-bg` | `#FAFBFC` | Fond de page |
| `--color-surface` | `#FFFFFF` | Fond de cartes et blocs |
| `--color-border` | `#E2E6ED` | Bordures, séparateurs |

### 2.2 Gris

| Token | Valeur | Usage |
|-------|--------|-------|
| `--gray-50` | `#F8F9FA` | Fond alterné |
| `--gray-100` | `#F1F3F5` | Fond désactivé |
| `--gray-200` | `#E2E6ED` | Bordures |
| `--gray-400` | `#9BA3B0` | Texte secondaire |
| `--gray-600` | `#5A6270` | Texte tertiaire |
| `--gray-800` | `#2D3340` | Texte principal alternatif |

### 2.3 Tons sémantiques

| Token | Valeur | Usage produit |
|-------|--------|--------------|
| `--semantic-neutral` | `#6B7280` | Information neutre, pas de jugement |
| `--semantic-signal` | `#3B82F6` | Signal d'information, données |
| `--semantic-candidate` | `#10B981` | Opportunité identifiée, potentiel positif |
| `--semantic-blocked` | `#EF4444` | Bloquant, friction majeure |
| `--semantic-warning` | `#F59E0B` | Attention requise, risque modéré |
| `--semantic-top-priority` | `#7C3AED` | Priorité maximale, action recommandée |

### 2.4 Typographie

| Token | Valeur | Usage |
|-------|--------|-------|
| `--font-family` | `'Inter', system-ui, sans-serif` | Tout le produit |
| `--text-xs` | `12px / 1.5` | Labels secondaires, metadata |
| `--text-sm` | `14px / 1.5` | Body secondaire, hints |
| `--text-base` | `16px / 1.6` | Body principal |
| `--text-lg` | `18px / 1.5` | Sous-titres de section |
| `--text-xl` | `22px / 1.3` | Titres de section |
| `--text-2xl` | `28px / 1.2` | Titres de page |
| `--text-3xl` | `36px / 1.1` | Hero titre (landing) |

### 2.5 Espacements

| Token | Valeur | Usage |
|-------|--------|-------|
| `--space-1` | `4px` | Micro-espacement interne |
| `--space-2` | `8px` | Espacement interne compact |
| `--space-3` | `12px` | Padding boutons, gaps petits |
| `--space-4` | `16px` | Padding standard cartes |
| `--space-6` | `24px` | Gap entre éléments |
| `--space-8` | `32px` | Gap entre sections |
| `--space-12` | `48px` | Séparation de blocs majeurs |
| `--space-16` | `64px` | Séparation de sections page |

### 2.6 Autres tokens

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-sm` | `4px` | Inputs, tags |
| `--radius-md` | `8px` | Cartes, boutons |
| `--radius-lg` | `12px` | Modals, panels |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cartes au repos |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Cartes en hover, éléments élevés |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, overlays |
| `--width-content` | `720px` | Largeur contenu lecture (audit, synthèse) |
| `--width-content-wide` | `960px` | Largeur contenu élargi (rapport) |
| `--width-max` | `1200px` | Largeur max page |

---

## 3. Composants de base

### 3.1 Button

**Usage** : Actions principales et secondaires sur tous les écrans.

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | Style visuel |
| `size` | `'sm' \| 'md' \| 'lg'` | Taille |
| `disabled` | `boolean` | Désactivé |
| `loading` | `boolean` | État de chargement |
| `fullWidth` | `boolean` | Prend toute la largeur (mobile) |
| `icon` | `ReactNode` | Icône optionnelle à gauche |

**Variants** :
- `primary` : fond `--color-accent`, texte blanc. CTA principaux.
- `secondary` : fond transparent, bordure `--color-primary`. Actions secondaires.
- `ghost` : pas de fond ni bordure. Navigation, retour.
- `danger` : fond `--semantic-blocked`. Actions destructives (rare).

**Règles** :
- Un seul bouton `primary` visible par écran.
- Sur mobile, les boutons principaux sont `fullWidth`.

---

### 3.2 Card

**Usage** : Conteneur d'information structurée. Base pour FrictionCard, OpportunityCard, etc.

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined'` | Style |
| `padding` | `'compact' \| 'standard' \| 'spacious'` | Densité interne |
| `onClick` | `() => void` | Si cliquable (navigation, expand) |

---

### 3.3 Stepper

**Usage** : Progression dans l'audit.

| Prop | Type | Description |
|------|------|-------------|
| `steps` | `StepDef[]` | Liste des étapes `{ label, key }` |
| `currentStep` | `number` | Étape en cours (0-indexed) |
| `completedSteps` | `number[]` | Étapes complétées |

**Règles** :
- Sur mobile : affiche uniquement "Étape X sur Y" + barre de progression.
- Sur desktop : affiche le stepper complet avec labels.
- Les étapes complétées sont cliquables (retour arrière).
- L'étape en cours est visuellement distincte.

---

### 3.4 ProgressBar

**Usage** : Progression globale dans l'audit, complétion de section.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Pourcentage (0-100) |
| `label` | `string` | Texte affiché ("3 sur 7 complétées") |
| `variant` | `'default' \| 'semantic'` | Couleur neutre ou sémantique |

---

### 3.5 FieldGroup

**Usage** : Groupe de champs de formulaire dans l'audit.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Label métier du groupe |
| `hint` | `string` | Aide contextuelle |
| `example` | `string` | Exemple concret |
| `required` | `boolean` | Champ obligatoire |
| `error` | `string` | Message d'erreur |
| `children` | `ReactNode` | Input(s) |

**Règles** :
- Le hint est toujours visible (pas dans un tooltip).
- L'exemple est affiché en `--gray-400` sous le champ.
- L'erreur remplace le hint quand elle est active.

---

### 3.6 Tag

**Usage** : Labels catégoriels (archétype, statut, priorité).

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Texte du tag |
| `color` | `SemanticColor` | Couleur sémantique |
| `size` | `'sm' \| 'md'` | Taille |

---

### 3.7 SectionHeader

**Usage** : Titre de section dans un écran.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Titre principal |
| `subtitle` | `string` | Sous-titre explicatif |
| `badge` | `ReactNode` | Badge optionnel (score, count) |

---

## 4. Composants métier

### 4.1 ScoreBadge

**Usage** : Affichage d'un score avec explication. Utilisé dans Synthèse et Rapport.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Label métier ("Maturité commerciale") |
| `value` | `number` | Score (0-100) |
| `displayFormat` | `'numeric' \| 'letter' \| 'level'` | Format d'affichage (72, B+, "Intermédiaire") |
| `explanation` | `string` | Phrase explicative courte |
| `semanticColor` | `SemanticColor` | Couleur dérivée du score |

**Règles** :
- L'explication est toujours affichée, pas en hover.
- La couleur sémantique est calculée à partir du score (vert > 70, orange 40-70, rouge < 40).
- Le label est en langage métier, jamais technique.

---

### 4.2 FrictionCard

**Usage** : Affichage d'une friction identifiée. Utilisé dans Synthèse et Rapport.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Nom métier de la friction ("Ressaisie systématique des devis") |
| `severity` | `'low' \| 'medium' \| 'high' \| 'critical'` | Niveau de sévérité |
| `impact` | `string` | Impact estimé en langage concret |
| `source` | `string` | D'où vient cette détection (réponse audit, pattern) |
| `details` | `string` | Description complète (expand) |

**Règles** :
- Le titre est une phrase métier concrète, pas un code.
- La sévérité est affichée par couleur sémantique + label texte.
- La source (evidence) est toujours visible, même en mode compact.

---

### 4.3 OpportunityCard

**Usage** : Affichage d'une opportunité. Utilisé dans Synthèse (teaser) et Rapport (complet).

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Titre métier ("Automatiser la génération de devis") |
| `archetype` | `string` | Archétype associé |
| `dominantFriction` | `string` | Friction principale adressée |
| `expectedValue` | `string` | Valeur attendue en termes concrets |
| `feasibility` | `'low' \| 'medium' \| 'high'` | Faisabilité estimée |
| `risk` | `'low' \| 'medium' \| 'high'` | Risque estimé |
| `reasoning` | `string` | Pourquoi cette opportunité remonte |
| `rank` | `number` | Position dans le classement |
| `mode` | `'teaser' \| 'full'` | Mode d'affichage |

**Variantes** :
- `teaser` : titre + friction + valeur + CTA "voir le rapport complet". Utilisé dans Synthèse gratuite.
- `full` : toutes les props. Utilisé dans Rapport premium.

**Règles** :
- Le `reasoning` est toujours affiché en mode `full`.
- Le `rank` est affiché visuellement (#1, #2, #3…).
- En mode `teaser`, les champs `feasibility`, `risk` et `reasoning` sont masqués.

---

### 4.4 EvidenceBlock

**Usage** : Bloc de justification. Utilisé dans le Rapport pour montrer les données sources.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Contexte ("Basé sur vos réponses") |
| `items` | `EvidenceItem[]` | Liste de preuves `{ text, source }` |

**Règles** :
- Affiché dans un encart visuellement distinct (fond `--gray-50`, bordure gauche sémantique).
- Chaque item cite sa source.

---

### 4.5 ConfidenceBlock

**Usage** : Affichage du niveau de confiance et des limites. Utilisé dans Synthèse et Rapport.

| Prop | Type | Description |
|------|------|-------------|
| `level` | `'high' \| 'medium' \| 'low'` | Niveau de confiance |
| `message` | `string` | Explication ("Données insuffisantes sur le volet RH") |
| `missingData` | `string[]` | Liste des données manquantes |

**Règles** :
- Affiché uniquement si `level` est `medium` ou `low`.
- Le message est en langage simple.
- Les données manquantes sont listées concrètement.

---

### 4.6 PremiumGate

**Usage** : Bloc de transition vers le contenu premium. Affiché dans Synthèse et Paywall.

| Prop | Type | Description |
|------|------|-------------|
| `headline` | `string` | Titre accrocheur |
| `valuePoints` | `string[]` | Ce que le premium apporte (3-5 points) |
| `price` | `string` | Prix affiché |
| `ctaLabel` | `string` | Texte du CTA |
| `onCtaClick` | `() => void` | Action |

**Règles** :
- Les `valuePoints` sont formulés en termes de capacité de décision, pas de features.
- Le prix est affiché clairement.
- Pas de dark pattern (compte à rebours, stock limité).

---

### 4.7 PilotRecommendation

**Usage** : Bloc de recommandation de POC. Utilisé dans Rapport premium.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Titre du pilote |
| `scope` | `string` | Périmètre |
| `duration` | `string` | Durée estimée |
| `estimatedCost` | `string` | Fourchette de coût |
| `expectedOutcome` | `string` | Résultat attendu |
| `prerequisites` | `string[]` | Prérequis |

---

### 4.8 ConsultingCTA

**Usage** : Bloc d'upsell vers le conseil. Utilisé dans Rapport et page Conseil.

| Prop | Type | Description |
|------|------|-------------|
| `headline` | `string` | Accroche |
| `benefits` | `string[]` | Bénéfices concrets |
| `ctaLabel` | `string` | Texte du CTA |
| `onCtaClick` | `() => void` | Action |

---

## 5. Usage par écran

| Composant | Landing | Audit | Synthèse | Paywall | Rapport | Conseil |
|-----------|---------|-------|----------|---------|---------|---------|
| Button | x | x | x | x | x | x |
| Card | | | x | x | x | |
| Stepper | | x | | | | |
| ProgressBar | | x | | | | |
| FieldGroup | | x | | | | |
| Tag | | | x | | x | |
| SectionHeader | x | x | x | x | x | x |
| ScoreBadge | | | x | | x | |
| FrictionCard | | | x | | x | |
| OpportunityCard | | | x (teaser) | | x (full) | |
| EvidenceBlock | | | | | x | |
| ConfidenceBlock | | | x | | x | |
| PremiumGate | | | x | x | | |
| PilotRecommendation | | | | | x | |
| ConsultingCTA | | | | | x | x |

---

## 6. Règles d'affichage globales

### 6.1 États de chargement
- Chaque composant métier (ScoreBadge, FrictionCard, OpportunityCard) a un état skeleton.
- Le skeleton respecte les dimensions réelles du composant.
- Pas de spinner plein écran — chaque bloc charge indépendamment.

### 6.2 États vides
- Si aucune friction n'est détectée : message positif ("Aucune friction majeure détectée — votre organisation est bien structurée").
- Si données insuffisantes : ConfidenceBlock au lieu d'un bloc vide.

### 6.3 Interactions
- Les cartes cliquables ont un hover `--shadow-md` + cursor pointer.
- Les expansions (détail friction, evidence) utilisent un expand/collapse animé.
- Aucune interaction critique ne dépend du hover.

### 6.4 Accessibilité minimum
- Contraste texte/fond conforme WCAG AA.
- Focus visible sur tous les éléments interactifs.
- Labels associés à tous les champs de formulaire.
- Aria-labels sur les éléments non textuels (scores visuels, badges couleur).
