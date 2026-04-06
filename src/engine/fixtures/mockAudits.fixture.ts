import type { RawAuditInput } from '../domain/types';

/** Fixture A — PME BTP / devis par mail + Excel */
export const FIXTURE_A: RawAuditInput = {
  company_name: 'Menuiserie Dupont',
  company_size_band: '21-50',
  industry_hint: 'BTP / Construction',
  pain_text: 'Je perds du temps sur des tâches répétitives. On reçoit les demandes de devis par email, on les ressaisit dans Excel, puis on refait la saisie dans EBP pour la facturation. Les relances clients sont faites de mémoire.',
};

/** Fixture B — Reporting mensuel reconstruit */
export const FIXTURE_B: RawAuditInput = {
  company_name: 'Transports Martin',
  company_size_band: '6-20',
  industry_hint: 'Transport / Logistique',
  pain_text: 'Je n\'ai pas de visibilité sur mon activité. Chaque mois, je reconstruis mon tableau de bord dans Excel à partir de fichiers éparpillés. Le reporting me prend une journée complète et je n\'ai aucun indicateur fiable en temps réel.',
};

/** Fixture C — Documents dispersés */
export const FIXTURE_C: RawAuditInput = {
  company_name: 'Cabinet Lefèvre',
  company_size_band: '1-5',
  industry_hint: 'Services aux entreprises',
  pain_text: 'Mes outils ne sont pas connectés entre eux. Les dossiers clients sont répartis entre les emails, le serveur, des clés USB et du papier. Retrouver un document prend parfois 20 minutes. On passe plus de temps à chercher qu\'à traiter.',
};

/** Fixture D — Validation manuelle lente */
export const FIXTURE_D: RawAuditInput = {
  company_name: 'Négoce Durand',
  company_size_band: '21-50',
  industry_hint: 'Commerce / Négoce',
  pain_text: 'Mes équipes dépendent trop de quelques personnes. Les validations de commandes passent par email, sans aucune traçabilité. Si le directeur commercial est absent, tout est bloqué. On fait du suivi de relance à la main sans outil.',
};
