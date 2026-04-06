import { useState } from 'react';
import './ShortAuditForm.css';

interface ShortAuditFormProps {
  onSubmit: (data: Record<string, string>) => void;
}

const sectors = [
  'BTP / Construction',
  'Industrie / Fabrication',
  'Commerce / Négoce',
  'Services aux entreprises',
  'Transport / Logistique',
  'Santé / Médical',
  'Restauration / Hôtellerie',
  'Autre',
];

const painPoints = [
  'Je perds du temps sur des tâches répétitives',
  'Je n\'ai pas de visibilité sur mon activité',
  'Mes équipes dépendent trop de quelques personnes',
  'Mes outils ne sont pas connectés entre eux',
  'Je ne sais pas quoi améliorer en priorité',
  'Autre',
];

export function ShortAuditForm({ onSubmit }: ShortAuditFormProps) {
  const [form, setForm] = useState({
    company: '',
    sector: '',
    size: '',
    pain: '',
  });

  const isValid = form.company.trim() && form.sector && form.size && form.pain;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onSubmit(form);
  };

  return (
    <form className="audit-form" onSubmit={handleSubmit} aria-label="Formulaire d'audit rapide">
      <div className="audit-form__field">
        <label className="audit-form__label" htmlFor="company">
          Nom de votre entreprise
        </label>
        <span className="audit-form__hint">Le nom que vous utilisez au quotidien</span>
        <input
          className="audit-form__input"
          id="company"
          type="text"
          value={form.company}
          onChange={(e) => handleChange('company', e.target.value)}
          placeholder="Ex : Menuiserie Dupont"
          autoComplete="organization"
        />
      </div>

      <div className="audit-form__field">
        <label className="audit-form__label" htmlFor="sector">
          Secteur d'activité
        </label>
        <span className="audit-form__hint">Choisissez le plus proche de votre activité</span>
        <select
          className="audit-form__select"
          id="sector"
          value={form.sector}
          onChange={(e) => handleChange('sector', e.target.value)}
        >
          <option value="">Sélectionner</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="audit-form__field">
        <label className="audit-form__label" htmlFor="size">
          Nombre de salariés
        </label>
        <span className="audit-form__hint">CDI, CDD et intérimaires réguliers compris</span>
        <select
          className="audit-form__select"
          id="size"
          value={form.size}
          onChange={(e) => handleChange('size', e.target.value)}
        >
          <option value="">Sélectionner</option>
          <option value="1-5">1 à 5</option>
          <option value="6-20">6 à 20</option>
          <option value="21-50">21 à 50</option>
          <option value="51-250">51 à 250</option>
        </select>
      </div>

      <div className="audit-form__field">
        <label className="audit-form__label" htmlFor="pain">
          Votre principale difficulté aujourd'hui
        </label>
        <span className="audit-form__hint">Ce qui vous prend le plus de temps ou d'énergie</span>
        <select
          className="audit-form__select"
          id="pain"
          value={form.pain}
          onChange={(e) => handleChange('pain', e.target.value)}
        >
          <option value="">Sélectionner</option>
          {painPoints.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="audit-form__submit">
        <button
          className="cta cta--primary cta--full"
          type="submit"
          disabled={!isValid}
        >
          Voir mon diagnostic
        </button>
      </div>
    </form>
  );
}
