# CARACALLA — Event Instrumentation V1
## Sprint UX_00 — Dictionnaire d'events, payloads et conventions analytics

---

## 1. Objectif de l'instrumentation

Caracalla doit être instrumenté dès le premier sprint pour répondre à 5 questions produit fondamentales :

1. **Où les utilisateurs abandonnent-ils ?** (funnel drop-off)
2. **Quelle partie du flow crée le plus de confiance ?** (engagement par section)
3. **Qu'est-ce qui déclenche le paiement ?** (conversion triggers)
4. **Quelles synthèses donnent le plus envie de voir le premium ?** (content quality → conversion)
5. **Quels profils demandent le plus souvent du conseil ?** (segment → upsell)

---

## 2. Conventions de nommage

### 2.1 Format des events
```
<screen>_<action>
```

Exemples :
- `landing_view`
- `audit_step_completed`
- `paywall_cta_clicked`

### 2.2 Règles
- Tout en `snake_case`.
- Pas de préfixe `track_` ou `event_`.
- Les écrans sont : `landing`, `audit`, `summary`, `paywall`, `checkout`, `report`, `consulting`.
- Les actions sont des verbes au passé : `viewed`, `clicked`, `completed`, `started`, `abandoned`, `expanded`, `submitted`.

### 2.3 Propriétés
- Noms de propriétés en `snake_case`.
- Pas de données personnelles dans les events (pas de nom, email, téléphone).
- Les identifiants utilisent des IDs opaques.

---

## 3. Dictionnaire d'events

### 3.1 Landing

| Event | Déclencheur | Payload |
|-------|------------|---------|
| `landing_viewed` | Page landing affichée | `{ referrer, utm_source, utm_medium, utm_campaign, device_type }` |
| `landing_cta_clicked` | Clic sur CTA "Commencer l'audit" | `{ cta_position: 'hero' \| 'mid' \| 'bottom' }` |
| `landing_faq_expanded` | Clic sur une question FAQ | `{ faq_item: string }` |
| `landing_section_viewed` | Section visible dans le viewport | `{ section: 'hero' \| 'pain' \| 'what_you_get' \| 'how_it_works' \| 'trust' \| 'faq' }` |

### 3.2 Audit

| Event | Déclencheur | Payload |
|-------|------------|---------|
| `audit_started` | Première étape de l'audit commencée | `{ device_type, referrer }` |
| `audit_step_viewed` | Étape de l'audit affichée | `{ step_number, step_name, total_steps }` |
| `audit_step_completed` | Étape validée (clic suivant) | `{ step_number, step_name, duration_seconds, fields_filled, fields_total }` |
| `audit_step_back` | Retour à l'étape précédente | `{ from_step, to_step }` |
| `audit_saved` | Sauvegarde automatique ou manuelle | `{ step_number, completion_percentage }` |
| `audit_abandoned` | Quitte l'audit sans compléter (session timeout ou navigation away) | `{ last_step_number, completion_percentage, total_duration_seconds }` |
| `audit_completed` | Dernière étape validée | `{ total_duration_seconds, total_steps, device_type }` |

### 3.3 Synthèse gratuite

| Event | Déclencheur | Payload |
|-------|------------|---------|
| `summary_viewed` | Page synthèse affichée | `{ device_type, time_since_audit_completed_seconds }` |
| `summary_section_viewed` | Section de la synthèse visible | `{ section: 'snapshot' \| 'profile' \| 'frictions' \| 'opportunity' \| 'confidence' \| 'premium_gate' }` |
| `summary_friction_expanded` | Clic pour voir le détail d'une friction | `{ friction_id, friction_title, severity }` |
| `summary_opportunity_expanded` | Clic pour voir le détail de l'opportunité teaser | `{ opportunity_id, opportunity_title }` |
| `summary_scroll_depth` | Profondeur de scroll atteinte | `{ depth_percentage: 25 \| 50 \| 75 \| 100 }` |
| `summary_time_spent` | Temps passé sur la synthèse (au départ) | `{ duration_seconds }` |

### 3.4 Paywall

| Event | Déclencheur | Payload |
|-------|------------|---------|
| `paywall_viewed` | Page paywall affichée | `{ device_type, source: 'summary_cta' \| 'direct' }` |
| `paywall_comparison_viewed` | Tableau comparaison visible dans viewport | `{}` |
| `paywall_cta_clicked` | Clic sur CTA d'achat | `{ price }` |
| `paywall_faq_expanded` | Clic sur question FAQ paiement | `{ faq_item }` |
| `paywall_scroll_depth` | Profondeur de scroll | `{ depth_percentage: 25 \| 50 \| 75 \| 100 }` |

### 3.5 Checkout

| Event | Déclencheur | Payload |
|-------|------------|---------|
| `checkout_started` | Page checkout / modale Stripe ouverte | `{ price }` |
| `checkout_completed` | Paiement confirmé | `{ price, payment_method_type }` |
| `checkout_failed` | Erreur de paiement | `{ error_type }` |
| `checkout_abandoned` | Quitte le checkout sans payer | `{ duration_seconds }` |

### 3.6 Rapport premium

| Event | Déclencheur | Payload |
|-------|------------|---------|
| `report_viewed` | Page rapport affichée | `{ device_type, time_since_checkout_seconds }` |
| `report_section_viewed` | Section du rapport visible | `{ section: 'verdict' \| 'score' \| 'opportunities' \| 'prerequisites' \| 'risks' \| 'pilot' \| 'consulting_cta' }` |
| `report_opportunity_expanded` | Détail d'une opportunité ouvert | `{ opportunity_id, opportunity_rank, opportunity_title }` |
| `report_evidence_viewed` | Bloc evidence consulté | `{ section, opportunity_id }` |
| `report_scroll_depth` | Profondeur de scroll | `{ depth_percentage: 25 \| 50 \| 75 \| 100 }` |
| `report_time_spent` | Temps passé (au départ) | `{ duration_seconds }` |
| `report_exported` | Export PDF ou partage | `{ format: 'pdf' \| 'link' }` |

### 3.7 Conseil / Upsell

| Event | Déclencheur | Payload |
|-------|------------|---------|
| `consulting_cta_clicked` | Clic sur CTA conseil (depuis rapport ou page conseil) | `{ source: 'report' \| 'consulting_page' }` |
| `consulting_page_viewed` | Page conseil affichée | `{ device_type }` |
| `consulting_request_submitted` | Formulaire de demande envoyé | `{ company_size_band }` |

---

## 4. Dimensions transversales

Ces dimensions sont attachées à tous les events (via le contexte global, pas répétées dans chaque payload).

| Dimension | Type | Valeurs | Source |
|-----------|------|---------|--------|
| `session_id` | `string` | UUID | Généré côté client |
| `user_id` | `string \| null` | UUID ou null si anonyme | Auth / cookie |
| `device_type` | `enum` | `mobile`, `tablet`, `desktop` | User-agent + viewport |
| `company_size_band` | `enum` | `1-5`, `6-20`, `21-50`, `51-250`, `unknown` | Réponse audit step 1 |
| `sector_guess` | `string \| null` | Secteur déclaré | Réponse audit step 1 |
| `acquisition_channel` | `string` | `organic`, `paid`, `referral`, `direct` | UTM / referrer |
| `audit_completion_band` | `enum` | `0%`, `1-25%`, `26-50%`, `51-75%`, `76-99%`, `100%` | État audit |
| `session_duration_band` | `enum` | `<1min`, `1-5min`, `5-15min`, `15-30min`, `>30min` | Timer session |

---

## 5. Funnel principal

Le funnel de conversion est la métrique la plus importante. Il se lit :

```
landing_viewed
  → audit_started
    → audit_completed
      → summary_viewed
        → paywall_viewed
          → checkout_started
            → checkout_completed
              → report_viewed
                → consulting_cta_clicked
                  → consulting_request_submitted
```

### Taux à suivre

| Transition | Nom | Cible initiale |
|-----------|-----|---------------|
| landing → audit | Taux de démarrage | > 15% |
| audit_started → audit_completed | Taux de complétion audit | > 60% |
| summary → paywall | Taux d'intérêt premium | > 40% |
| paywall → checkout_started | Taux d'intention d'achat | > 20% |
| checkout_started → checkout_completed | Taux de conversion checkout | > 70% |
| report → consulting_cta | Taux d'intérêt conseil | > 15% |

---

## 6. Use cases analytics

### 6.1 Identifier les étapes d'abandon de l'audit
**Query** : Grouper `audit_abandoned` par `last_step_number`. Identifier les steps avec le plus fort taux d'abandon relatif.
**Action** : Simplifier ou scinder l'étape problématique.

### 6.2 Mesurer l'impact de la synthèse sur la conversion
**Query** : Corréler `summary_scroll_depth` et `summary_time_spent` avec `paywall_cta_clicked`.
**Action** : Optimiser les sections de la synthèse qui corrèlent le plus avec la conversion.

### 6.3 Comprendre les profils qui convertissent
**Query** : Segmenter `checkout_completed` par `company_size_band` et `sector_guess`.
**Action** : Ajuster le ciblage marketing et le wording.

### 6.4 Mesurer la valeur perçue du rapport
**Query** : Corréler `report_time_spent` et `report_section_viewed` avec `consulting_cta_clicked`.
**Action** : Identifier quelles sections du rapport déclenchent l'envie de conseil.

### 6.5 Détecter les frictions UX mobile
**Query** : Comparer les taux de funnel par `device_type`.
**Action** : Si mobile a un taux de complétion audit significativement plus bas, investiguer l'UX mobile de l'audit.

### 6.6 Qualifier l'acquisition
**Query** : Segmenter tout le funnel par `acquisition_channel`.
**Action** : Identifier les canaux qui amènent les utilisateurs les plus qualifiés (complétion audit + conversion).

---

## 7. Implémentation technique

### 7.1 Architecture recommandée

```typescript
// analytics.ts — module central
type EventName = 'landing_viewed' | 'audit_started' | ... ;

interface AnalyticsContext {
  session_id: string;
  user_id: string | null;
  device_type: 'mobile' | 'tablet' | 'desktop';
  company_size_band: string | null;
  sector_guess: string | null;
  acquisition_channel: string;
  audit_completion_band: string;
}

function track(event: EventName, payload?: Record<string, unknown>): void {
  // Merge context + payload
  // Send to analytics backend
}
```

### 7.2 Providers compatibles
Le module `track()` doit être agnostique du provider. Prévoir un adaptateur pour :
- **Plausible** (privacy-first, recommandé pour le lancement)
- **PostHog** (si besoin de session replay et feature flags plus tard)
- **Console** (mode développement)

### 7.3 Règles d'implémentation
- Chaque event est envoyé une seule fois par déclencheur (pas de doublons sur re-render).
- Les events de type `_viewed` utilisent l'Intersection Observer, pas le mount du composant.
- Les events de type `_time_spent` sont envoyés au `beforeunload` ou `visibilitychange`.
- Les events de type `_scroll_depth` sont envoyés par paliers (25%, 50%, 75%, 100%), une seule fois chacun.
- En cas d'erreur d'envoi, les events sont mis en queue locale et retentés.
