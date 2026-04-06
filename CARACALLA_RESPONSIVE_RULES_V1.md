# CARACALLA — Responsive Rules V1
## Sprint UX_00 — Règles mobile / tablet / desktop

---

## 1. Philosophie responsive

Le responsive Caracalla ne consiste pas à compresser un layout desktop. Il consiste à **réorganiser l'information selon le mode de lecture** de chaque device.

- **Mobile** : lecture narrative, séquentielle, une information à la fois.
- **Tablette** : lecture enrichie, deux colonnes légères, comparaison possible.
- **Desktop** : lecture cockpit, densité élevée, vision d'ensemble.

---

## 2. Breakpoints

| Nom | Largeur | Usage |
|-----|---------|-------|
| `mobile` | `< 640px` | Smartphones portrait |
| `tablet` | `640px — 1023px` | Tablettes, smartphones paysage |
| `desktop` | `>= 1024px` | Laptops, desktop |
| `desktop-wide` | `>= 1280px` | Grand écran, panels latéraux |

**Implémentation** :
```css
--breakpoint-sm: 640px;
--breakpoint-md: 1024px;
--breakpoint-lg: 1280px;
```

Convention : mobile-first. Les styles de base sont mobile, les media queries ajoutent les comportements tablet et desktop.

---

## 3. Layouts par breakpoint

### 3.1 Mobile (< 640px)

| Propriété | Valeur |
|-----------|--------|
| Colonnes | 1 |
| Padding horizontal | `16px` |
| Max-width contenu | `100%` |
| Navigation | Header minimal + CTA sticky bottom |
| Cartes | Full width, empilées |
| Tableaux | Convertis en cartes empilées |
| Stepper | Réduit à "Étape X/Y" + barre |
| Sidebar / rail | Masqué |

### 3.2 Tablette (640px — 1023px)

| Propriété | Valeur |
|-----------|--------|
| Colonnes | 1 ou 2 selon le contexte |
| Padding horizontal | `24px` |
| Max-width contenu | `720px` centré |
| Navigation | Header complet |
| Cartes | 2 par ligne si comparaison, sinon full width |
| Tableaux | Simplifiés (colonnes essentielles) |
| Stepper | Complet avec labels courts |
| Sidebar / rail | Optionnel, collapsable |

### 3.3 Desktop (>= 1024px)

| Propriété | Valeur |
|-----------|--------|
| Colonnes | 1, 2 ou 3 selon le contexte |
| Padding horizontal | `32px` |
| Max-width contenu | `960px` (lecture) / `1200px` (rapport) |
| Navigation | Header complet + navigation rapport si applicable |
| Cartes | Grille 2-3 colonnes |
| Tableaux | Complets |
| Stepper | Complet avec labels |
| Sidebar / rail | Visible (context rail, navigation rapport) |

### 3.4 Desktop wide (>= 1280px)

| Propriété | Valeur |
|-----------|--------|
| Colonnes | Jusqu'à 3 + panel latéral |
| Max-width contenu | `1200px` centré |
| Evidence panel | Panel latéral fixe dans le rapport |

---

## 4. Règles par écran

### 4.1 Landing

| Élément | Mobile | Tablette | Desktop |
|---------|--------|----------|---------|
| Hero | Titre + CTA empilés, centré | Titre + CTA côte à côte | Titre large + illustration |
| Pain statement | Liste verticale | 2 colonnes | 3-4 colonnes |
| How it works | Étapes empilées | 3 colonnes | 3 colonnes |
| CTA principal | Sticky bottom | Inline | Inline |
| FAQ | Accordéon | Accordéon | Accordéon ou 2 colonnes |

### 4.2 Audit

| Élément | Mobile | Tablette | Desktop |
|---------|--------|----------|---------|
| Stepper | "Étape X/Y" + barre | Stepper complet | Stepper complet |
| Formulaire | 1 champ par ligne | 1-2 champs par ligne | 2 champs par ligne max |
| Context rail | Masqué | Collapsable | Visible à droite (240px) |
| Boutons navigation | Full width, sticky bottom | Inline, alignés droite | Inline, alignés droite |
| Hints | Sous chaque champ | Sous chaque champ | Sous chaque champ |

### 4.3 Synthèse gratuite

| Élément | Mobile | Tablette | Desktop |
|---------|--------|----------|---------|
| Executive snapshot | Full width, texte | Full width | Full width |
| Frictions | Cards empilées | Cards 2 colonnes | Cards 2 colonnes |
| Opportunity teaser | Card full width | Card full width | Card avec panel détail |
| ConfidenceBlock | Full width | Full width | Sidebar ou inline |
| CTA premium | Sticky bottom | Inline | Inline |

### 4.4 Paywall

| Élément | Mobile | Tablette | Desktop |
|---------|--------|----------|---------|
| Comparaison gratuit/premium | Liste empilée | Tableau 2 colonnes | Tableau 2 colonnes |
| Prix + CTA | Sticky bottom | Centré | Centré |

### 4.5 Rapport premium

| Élément | Mobile | Tablette | Desktop |
|---------|--------|----------|---------|
| Navigation rapport | Menu hamburger ou select | Tabs horizontaux | Sidebar navigation fixe |
| Verdict | Full width | Full width | Full width, panel evidence latéral |
| Opportunités | Cards empilées | Cards empilées avec expand | Grille 2 colonnes + detail panel |
| Evidence | Inline sous chaque section | Inline | Panel latéral (desktop-wide) ou inline |
| Plan pilote | Card full width | Card full width | Card centrée large |

### 4.6 Conseil

| Élément | Mobile | Tablette | Desktop |
|---------|--------|----------|---------|
| Layout | Empilé simple | 2 colonnes | 2 colonnes |
| CTA | Sticky bottom | Inline | Inline |

---

## 5. Densité d'information

### 5.1 Principe
La densité augmente avec la taille d'écran :

| Device | Densité | Conséquence |
|--------|---------|-------------|
| Mobile | Basse | 1 information par bloc visible. Expand pour détail. |
| Tablette | Moyenne | Comparaisons 2 colonnes. Détails visibles sans expand. |
| Desktop | Haute | Panneaux multiples. Détails + evidence visibles simultanément. |

### 5.2 Règles de condensation mobile
- Les descriptions longues sont tronquées avec "Voir plus".
- Les scores affichent valeur + label, pas l'explication (disponible en expand).
- Les listes de plus de 3 éléments sont tronquées avec "Voir tout (N)".
- Les OpportunityCards en mode teaser n'affichent que titre + friction + valeur.

### 5.3 Règles d'expansion desktop
- Les FrictionCards affichent le détail directement (pas d'expand nécessaire).
- Les OpportunityCards en mode full affichent toutes les props.
- Le context rail est visible dans l'audit.
- Le panel evidence est visible dans le rapport (desktop-wide).

---

## 6. Adaptations d'interaction

### 6.1 Cibles tactiles
- Taille minimum des zones cliquables : `44px x 44px` (recommandation Apple/Google).
- Espacement minimum entre cibles tactiles : `8px`.
- Les boutons sur mobile sont toujours `fullWidth` ou assez larges pour un pouce.

### 6.2 CTA sticky
Sur mobile, les CTA principaux sont en position `sticky` en bas d'écran :
- Fond blanc avec `--shadow-md` inversé (ombre vers le haut).
- Padding : `12px 16px`.
- Le contenu scrollable a un padding-bottom suffisant pour ne pas être masqué.

### 6.3 Gestes
- Swipe horizontal : **non utilisé**. Pas de navigation par swipe pour éviter les faux positifs.
- Scroll vertical : seul mode de navigation dans le contenu.
- Pull-to-refresh : non implémenté (pas de données temps réel).

### 6.4 Formulaires mobile
- Chaque champ occupe toute la largeur.
- Les selects utilisent le select natif du device.
- Le clavier adapté est déclenché (type="email", type="tel", inputmode="numeric").
- Le bouton "Suivant" est visible au-dessus du clavier (sticky bottom).

---

## 7. Règles strictes (non négociables)

1. **Aucun bloc essentiel ne dépend d'un hover.**
   Tout ce qui est hover sur desktop est visible par défaut sur mobile ou accessible par tap.

2. **Aucun tableau critique ne devient illisible.**
   Les tableaux de plus de 3 colonnes sont convertis en cartes sur mobile.

3. **Aucun wording important n'est perdu dans un tooltip.**
   Les explications sont inline ou dans un bloc expand, jamais uniquement en tooltip.

4. **Aucune action majeure ne dépend d'une grande précision souris.**
   Les CTA sont larges. Les liens dans les textes sont complétés par des boutons dédiés.

5. **Le responsive réordonne l'information, pas juste compresse.**
   Exemple : sur desktop, frictions en grille 2 colonnes. Sur mobile, frictions en liste ordonnée par sévérité.

6. **Le contenu "above the fold" doit être autosuffisant.**
   Sur chaque device, ce qui est visible sans scroll doit porter le message principal de l'écran.

7. **Les images et illustrations sont optionnelles.**
   Le produit doit fonctionner entièrement sans image. Les illustrations enrichissent mais ne portent jamais l'information.

---

## 8. Tests responsive minimum

Avant chaque release, tester sur :

| Device | Résolution | Orientation |
|--------|-----------|-------------|
| iPhone SE | 375 x 667 | Portrait |
| iPhone 14 | 390 x 844 | Portrait |
| iPad | 768 x 1024 | Portrait + Paysage |
| Laptop 13" | 1280 x 800 | — |
| Desktop 24" | 1920 x 1080 | — |

Tests critiques :
- [ ] Le CTA principal est visible sans scroll sur tous les devices.
- [ ] L'audit est complétable intégralement sur mobile.
- [ ] Le rapport est lisible sur mobile (pas de scroll horizontal).
- [ ] Les scores sont compréhensibles sur mobile (label + valeur visibles).
- [ ] Le paywall affiche le prix et le CTA sans scroll sur mobile.
