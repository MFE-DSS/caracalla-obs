# CARACALLA — Screen Blueprints V1
## Sprint UX_00 — Wireframes textuels et structure des pages

---

## 1. Convention de lecture

Les blueprints ci-dessous décrivent chaque écran de haut en bas, dans l'ordre de lecture. Chaque bloc est noté :

```
[BLOC] Nom du bloc
  → Contenu principal
  → Contenu secondaire
  → Action / CTA
```

Les annotations entre parenthèses indiquent les variantes responsive :
- `(M)` = mobile uniquement
- `(D)` = desktop uniquement
- `(T+)` = tablette et au-dessus

---

## 2. Landing (`/`)

```
┌─────────────────────────────────────────────────┐
│ [HEADER]                                        │
│   Logo Caracalla (gauche)                       │
│   CTA "Commencer l'audit" (droite)              │
├─────────────────────────────────────────────────┤
│ [HERO]                                          │
│   Titre : "Votre entreprise a des process.      │
│            Sont-ils au bon niveau ?"             │
│   Sous-titre : "Un audit opérationnel gratuit   │
│     de 15 minutes pour identifier vos vrais     │
│     points de friction."                        │
│   → CTA : "Commencer l'audit gratuit"           │
├─────────────────────────────────────────────────┤
│ [PAIN STATEMENT]                                │
│   Titre section : "Vous vous reconnaissez ?"    │
│   → 4 cartes douleur (M: empilées, D: 2x2)     │
│     • "Ressaisie des mêmes informations"        │
│     • "Relances manuelles oubliées"             │
│     • "Pas de visibilité sur l'activité"        │
│     • "Dépendance à une seule personne"         │
├─────────────────────────────────────────────────┤
│ [WHAT YOU GET]                                  │
│   Titre : "Ce que vous obtenez"                 │
│   → 3 items (M: liste, D: 3 colonnes)          │
│     • Synthèse des frictions (gratuit)          │
│     • Classement des pistes                     │
│     • Vision claire des pertes de temps         │
├─────────────────────────────────────────────────┤
│ [HOW IT WORKS]                                  │
│   Titre : "Comment ça marche"                   │
│   → 3 étapes numérotées (M: empilées, D: 3 col)│
│     1. Répondez à l'audit — 15 min              │
│     2. Recevez votre synthèse — gratuit         │
│     3. Débloquez le rapport complet              │
├─────────────────────────────────────────────────┤
│ [TRUST]                                         │
│   Titre : "Transparence totale"                 │
│   → Texte : "Pas de boîte noire. Chaque         │
│     résultat vous montre d'où il vient."        │
│   → Icônes : explicabilité, données protégées,  │
│     pas de revente                              │
├─────────────────────────────────────────────────┤
│ [CTA SECONDAIRE]                                │
│   Texte : "C'est gratuit — commencer maintenant"│
│   → CTA : "Commencer l'audit"                   │
├─────────────────────────────────────────────────┤
│ [FAQ]                                           │
│   4-6 questions en accordéon                    │
│   • "Combien de temps dure l'audit ?"           │
│   • "Qu'est-ce qui est gratuit ?"               │
│   • "Comment sont calculés les résultats ?"     │
│   • "Mes données sont-elles protégées ?"        │
│   • "Que contient le rapport payant ?"          │
├─────────────────────────────────────────────────┤
│ [FOOTER]                                        │
│   Mentions légales — Contact — CGV              │
└─────────────────────────────────────────────────┘

(M) CTA sticky en bas d'écran permanent
```

---

## 3. Audit — Étape type (`/audit/:step`)

```
┌─────────────────────────────────────────────────┐
│ [HEADER AUDIT]                                  │
│   Logo (gauche)                                 │
│   "Sauvegarder" (droite)                        │
├─────────────────────────────────────────────────┤
│ [STEPPER]                                       │
│   (M) "Étape 3 sur 7" + barre de progression   │
│   (T+) Stepper complet avec labels :            │
│     ① Entreprise  ② Commercial  ③ Production   │
│     ④ Admin  ⑤ Équipes  ⑥ Pilotage ⑦ Priorités│
├─────────────────────────────────────────────────┤
│ [MICRO-FEEDBACK]                                │
│   "Votre carte se construit — encore 4 étapes." │
├─────────────────────────────────────────────────┤
│ [MAIN FORM]                           (D)[RAIL]│
│                                       │         │
│  Titre : "Votre activité commerciale" │ Résumé  │
│                                       │ des     │
│  Champ 1 :                            │ étapes  │
│    Label : "Volume de devis mensuel"  │ précé-  │
│    Hint : "Nombre approximatif"       │ dentes  │
│    [Input numérique]                  │         │
│                                       │ • Sect: │
│  Champ 2 :                            │   BTP   │
│    Label : "Outil de devis actuel"    │ • Taille│
│    Hint : "Ex : Excel, EBP, Sage"    │   22 sal│
│    [Select]                           │         │
│                                       │         │
│  Champ 3 :                            │         │
│    Label : "Délai moyen d'un devis"   │         │
│    Hint : "De la demande à l'envoi"   │         │
│    [Select : même jour / 1-2j /       │         │
│     3-5j / plus d'une semaine]        │         │
│                                       │         │
├───────────────────────────────────────┴─────────┤
│ [NAVIGATION]                                    │
│   (M) Sticky bottom :                           │
│     [← Retour]          [Continuer →]           │
│   (D) Inline aligné droite :                    │
│     [← Retour]  [Continuer →]                   │
└─────────────────────────────────────────────────┘
```

---

## 4. Synthèse gratuite (`/synthese`)

```
┌─────────────────────────────────────────────────┐
│ [HEADER]                                        │
│   Logo — "Votre synthèse"                       │
├─────────────────────────────────────────────────┤
│ [EXECUTIVE SNAPSHOT]                            │
│   "Voici ce que nous avons compris :"           │
│   "[Entreprise BTP, 22 salariés, basée en       │
│    Gironde. Activité principalement en B2B,     │
│    avec un volume de 60 devis/mois. Outils      │
│    actuels : Excel + EBP.]"                     │
│                                                 │
│   Tag : "Profil : PME industrielle classique"   │
├─────────────────────────────────────────────────┤
│ [FRICTIONS DOMINANTES]                          │
│   Titre : "Les points de friction identifiés"   │
│                                                 │
│   (M: cartes empilées, D: grille 2 colonnes)    │
│                                                 │
│   ┌─── FrictionCard ────────────────────┐       │
│   │ ● Impact fort                       │       │
│   │ "Ressaisie systématique des devis"  │       │
│   │ Chaque devis est saisi dans Excel   │       │
│   │ puis ressaisi dans EBP pour la      │       │
│   │ facturation.                        │       │
│   │ Source : réponses étapes 2 et 4     │       │
│   └─────────────────────────────────────┘       │
│                                                 │
│   ┌─── FrictionCard ────────────────────┐       │
│   │ ● Impact significatif               │       │
│   │ "Relances clients manuelles"        │       │
│   │ Aucun suivi automatisé des devis    │       │
│   │ envoyés. Relances par mémoire.      │       │
│   │ Source : réponse étape 2            │       │
│   └─────────────────────────────────────┘       │
│                                                 │
│   ┌─── FrictionCard ────────────────────┐       │
│   │ ● Impact modéré                     │       │
│   │ "Absence de tableau de bord"        │       │
│   │ Pas de vision consolidée de         │       │
│   │ l'activité en cours.                │       │
│   │ Source : réponse étape 6            │       │
│   └─────────────────────────────────────┘       │
├─────────────────────────────────────────────────┤
│ [OPPORTUNITY TEASER]                            │
│   Titre : "Votre piste prioritaire"             │
│                                                 │
│   ┌─── OpportunityCard (teaser) ────────┐       │
│   │ #1                                  │       │
│   │ "Automatiser la chaîne devis →      │       │
│   │  facture"                           │       │
│   │                                     │       │
│   │ Friction : Ressaisie des devis      │       │
│   │ Valeur : ~5h/semaine récupérées     │       │
│   │                                     │       │
│   │ [Le rapport complet détaille la     │       │
│   │  faisabilité, le coût et le plan →] │       │
│   └─────────────────────────────────────┘       │
├─────────────────────────────────────────────────┤
│ [CONFIDENCE BLOCK] (si applicable)              │
│   ⚠ "Données insuffisantes sur le volet RH.    │
│      Le diagnostic RH n'est pas inclus dans     │
│      cette synthèse."                           │
├─────────────────────────────────────────────────┤
│ [PREMIUM GATE]                                  │
│   "Cette synthèse couvre les frictions          │
│    principales. Le rapport complet ajoute :"   │
│   • Toutes les opportunités classées            │
│   • Faisabilité et coûts estimés                │
│   • Plan pilote concret                         │
│   • Risques et prérequis                        │
│                                                 │
│   → CTA : "Voir le rapport complet — 49 € HT"  │
│                                                 │
│   (M) CTA sticky bottom                        │
└─────────────────────────────────────────────────┘
```

---

## 5. Paywall (`/rapport/upgrade`)

```
┌─────────────────────────────────────────────────┐
│ [HEADER]                                        │
│   Logo — "Le rapport complet"                   │
├─────────────────────────────────────────────────┤
│ [RAPPEL SYNTHÈSE]                               │
│   "Votre synthèse a identifié 3 points de      │
│    friction et 1 piste prioritaire."            │
├─────────────────────────────────────────────────┤
│ [VALEUR DU RAPPORT]                             │
│   Titre : "Tout ce que vous pourrez décider"    │
│                                                 │
│   (M: liste empilée, T+: tableau 2 colonnes)    │
│                                                 │
│   Synthèse gratuite    │  Rapport complet       │
│   ──────────────────   │  ──────────────────    │
│   ✓ Frictions princ.  │  ✓ Toutes frictions    │
│   ✓ 1 opportunité     │  ✓ Toutes opportunités │
│   ✗ Faisabilité       │  ✓ Faisabilité détail. │
│   ✗ Coûts estimés     │  ✓ Coûts estimés       │
│   ✗ Prérequis         │  ✓ Prérequis listés    │
│   ✗ Risques           │  ✓ Risques + mitigation│
│   ✗ Plan pilote       │  ✓ Plan pilote concret │
├─────────────────────────────────────────────────┤
│ [PRIX + CTA]                                    │
│   "49 € HT — accès immédiat et permanent"       │
│   → CTA : "Obtenir mon rapport complet"          │
│   Mention : "Satisfait ou remboursé sous 7 j."  │
│                                                 │
│   (M) CTA sticky bottom                        │
├─────────────────────────────────────────────────┤
│ [FAQ PAIEMENT]                                  │
│   • "Comment se passe le paiement ?"            │
│   • "Sous quel format reçois-je le rapport ?"   │
│   • "Puis-je me faire rembourser ?"             │
└─────────────────────────────────────────────────┘
```

---

## 6. Rapport premium (`/rapport`)

```
┌─────────────────────────────────────────────────┐
│ [HEADER]                                        │
│   Logo — "Votre rapport"                        │
│   (D) [Exporter PDF]                            │
├─────────────────────────────────────────────────┤
│ (D) [SIDEBAR NAV]        [CONTENU PRINCIPAL]    │
│ │ • Diagnostic    │                             │
│ │ • Opportunités  │  [EXECUTIVE VERDICT]        │
│ │ • Prérequis     │  "Votre entreprise présente │
│ │ • Risques       │   un profil opérationnel    │
│ │ • Plan pilote   │   classique de PME en       │
│ │ • Aller + loin  │   croissance, avec des      │
│ │                 │   process manuels qui        │
│ │                 │   freinent la montée en      │
│ │                 │   charge. 3 opportunités     │
│ │                 │   concrètes ont été          │
│ │                 │   identifiées."              │
│ │                 │                             │
│ │                 │  [SCORE GLOBAL]              │
│ │                 │  ┌──────────────────────┐    │
│ │                 │  │ Maturité opérat. : 45/100│
│ │                 │  │ "Niveau intermédiaire.    │
│ │                 │  │  Des bases en place mais  │
│ │                 │  │  beaucoup de process      │
│ │                 │  │  manuels."                │
│ │                 │  └──────────────────────┘    │
│ (M) [SELECT NAV]  │                             │
├───────────────────┼─────────────────────────────┤
│                   │  [OPPORTUNITÉS CLASSÉES]     │
│                   │  Titre : "Vos pistes, par    │
│                   │   ordre de priorité"         │
│                   │                             │
│                   │  (M: cards empilées)          │
│                   │  (D: grille 2 col + expand)   │
│                   │                             │
│                   │  ┌─ OpportunityCard #1 ──┐   │
│                   │  │ "Automatiser devis →   │   │
│                   │  │  facture"              │   │
│                   │  │ Archétype : Flux admin │   │
│                   │  │ Friction : Ressaisie   │   │
│                   │  │ Valeur : ~5h/sem       │   │
│                   │  │ Faisabilité : Haute    │   │
│                   │  │ Risque : Faible        │   │
│                   │  │                        │   │
│                   │  │ Pourquoi cette piste :  │   │
│                   │  │ "Vous ressaisissez 60  │   │
│                   │  │  devis/mois d'Excel    │   │
│                   │  │  vers EBP. Un outil    │   │
│                   │  │  intégré supprimerait  │   │
│                   │  │  cette étape."         │   │
│                   │  │                        │   │
│                   │  │ [Evidence]              │   │
│                   │  │ • Réponse étape 2 :    │   │
│                   │  │   "devis sous Excel"   │   │
│                   │  │ • Réponse étape 4 :    │   │
│                   │  │   "facturation EBP"    │   │
│                   │  └────────────────────────┘   │
│                   │                             │
│                   │  ┌─ OpportunityCard #2 ──┐   │
│                   │  │ ...                    │   │
│                   │  └────────────────────────┘   │
├───────────────────┼─────────────────────────────┤
│                   │  [PRÉREQUIS]                 │
│                   │  Titre : "Ce qui doit être   │
│                   │   en place"                  │
│                   │                             │
│                   │  • "Centraliser la base       │
│                   │    clients dans un seul outil"│
│                   │  • "Nommer un référent        │
│                   │    digital interne"           │
│                   │  • "Définir le format de      │
│                   │    devis standard"            │
├───────────────────┼─────────────────────────────┤
│                   │  [RISQUES]                   │
│                   │  Titre : "Les risques à      │
│                   │   anticiper"                 │
│                   │                             │
│                   │  ┌── RiskCard ───────────┐   │
│                   │  │ ● Risque modéré       │   │
│                   │  │ "Résistance au        │   │
│                   │  │  changement"          │   │
│                   │  │ Mitigation : "Impli-  │   │
│                   │  │  quer l'équipe dès le │   │
│                   │  │  choix de l'outil"    │   │
│                   │  └───────────────────────┘   │
├───────────────────┼─────────────────────────────┤
│                   │  [PLAN PILOTE]               │
│                   │  Titre : "Notre recommanda-  │
│                   │   tion : commencez par là"    │
│                   │                             │
│                   │  ┌─ PilotRecommendation ─┐   │
│                   │  │ "Automatiser la chaîne │   │
│                   │  │  devis → facture"      │   │
│                   │  │                        │   │
│                   │  │ Périmètre : devis +    │   │
│                   │  │  facturation           │   │
│                   │  │ Durée : 6-8 semaines   │   │
│                   │  │ Coût estimé : 3-8k€    │   │
│                   │  │ Résultat attendu :     │   │
│                   │  │  suppression ressaisie,│   │
│                   │  │  gain ~5h/semaine      │   │
│                   │  │                        │   │
│                   │  │ Prérequis :            │   │
│                   │  │ • Base clients unifiée │   │
│                   │  │ • Format devis standard│   │
│                   │  └────────────────────────┘   │
├───────────────────┼─────────────────────────────┤
│                   │  [CONSULTING CTA]            │
│                   │  "Besoin d'aide pour passer  │
│                   │   à l'action ?"              │
│                   │                             │
│                   │  • Cadrage du pilote          │
│                   │  • Mise en place              │
│                   │  • Suivi sur 3 mois           │
│                   │                             │
│                   │  → CTA : "Demander un        │
│                   │    échange"                   │
└───────────────────┴─────────────────────────────┘
```

---

## 7. Conseil (`/conseil`)

```
┌─────────────────────────────────────────────────┐
│ [HEADER]                                        │
│   Logo — "Aller plus loin"                      │
├─────────────────────────────────────────────────┤
│ [RAPPEL RAPPORT]                                │
│   "Votre rapport a identifié [N] pistes         │
│    d'amélioration. La priorité #1 :             │
│    [titre opportunité]."                        │
├─────────────────────────────────────────────────┤
│ [CE QUE LE CONSEIL APPORTE]                     │
│   Titre : "Un accompagnement pour passer du     │
│    diagnostic à l'action"                       │
│                                                 │
│   (M: liste, D: 3 colonnes)                     │
│                                                 │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│   │ Cadrage      │ │ Mise en place│ │ Suivi    ││
│   │              │ │              │ │          ││
│   │ Définition   │ │ Sélection    │ │ Mesure   ││
│   │ du périmètre │ │ de l'outil,  │ │ des      ││
│   │ et des       │ │ paramétrage, │ │ résultats││
│   │ objectifs    │ │ formation    │ │ sur 3    ││
│   │ mesurables.  │ │ équipe.      │ │ mois.    ││
│   └──────────────┘ └──────────────┘ └──────────┘│
├─────────────────────────────────────────────────┤
│ [FORMAT]                                        │
│   • Durée : 3 mois                              │
│   • Format : à distance + 1 visite site         │
│   • Livrables : plan projet, config outil,      │
│     rapport de suivi mensuel                    │
├─────────────────────────────────────────────────┤
│ [CTA]                                           │
│   → "Demander un échange"                        │
│   Sous-texte : "Échange de 30 min, sans         │
│    engagement, pour voir si l'accompagnement    │
│    est pertinent pour vous."                    │
│                                                 │
│   [Formulaire simple : nom, email, téléphone,   │
│    message optionnel]                           │
│                                                 │
│   (M) CTA sticky bottom                        │
└─────────────────────────────────────────────────┘
```

---

## 8. Ordre de lecture par device

### Mobile
Chaque écran se lit **de haut en bas, sans alternative**. L'ordre des blocs est l'ordre de lecture. Le CTA est en sticky bottom pour être toujours accessible.

### Tablette
Même ordre vertical, mais certaines sections passent en 2 colonnes (pain statement, frictions, opportunités) pour permettre la comparaison visuelle.

### Desktop
L'ordre vertical est enrichi de **panneaux latéraux** :
- Audit : context rail à droite.
- Rapport : sidebar navigation à gauche, evidence panel à droite (desktop-wide).

L'information principale reste dans la colonne centrale. Les panneaux latéraux sont des **accélérateurs**, pas des porteurs d'information critique.

---

## 9. Récapitulatif des CTA par écran

| Écran | CTA principal | Position | Destination |
|-------|--------------|----------|-------------|
| Landing | "Commencer l'audit gratuit" | Hero + bottom + sticky (M) | `/audit/1` |
| Audit | "Continuer" | Bottom form + sticky (M) | `/audit/:next` |
| Synthèse | "Voir le rapport complet" | Premium gate + sticky (M) | `/rapport/upgrade` |
| Paywall | "Obtenir mon rapport complet" | Prix block + sticky (M) | `/checkout` |
| Rapport | "Demander un échange" | Consulting CTA block | `/conseil` |
| Conseil | "Demander un échange" | Form block + sticky (M) | Submit form |
