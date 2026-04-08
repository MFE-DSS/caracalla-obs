import { useEffect, useState, useCallback } from 'react';
import {
  createShareLink,
  listShareLinks,
  revokeShareLink,
  type ShareLink,
} from '../services/shareApi';
import './ShareLinkPanel.css';

interface Props {
  auditId: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ShareLinkPanel({ auditId }: Props) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listShareLinks(auditId);
      setLinks(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const link = await createShareLink(auditId);
      setLinks((prev) => [link, ...prev]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (token: string) => {
    setError(null);
    const ok = await revokeShareLink(token);
    if (ok) {
      setLinks((prev) => prev.filter((l) => l.token !== token));
    } else {
      setError('Impossible de révoquer ce lien.');
    }
  };

  const handleCopy = async (url: string, token: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedToken(token);
      setTimeout(() => setCopiedToken((t) => (t === token ? null : t)), 2000);
    } catch {
      /* silent — copy is best effort */
    }
  };

  return (
    <div className="share-panel" aria-label="Partage du rapport">
      <div className="share-panel__header">
        <h3 className="share-panel__title">Partager ce rapport</h3>
        <p className="share-panel__subtitle">
          Générez un lien de lecture seule à envoyer à un associé, un DAF ou un responsable ops.
          Le lien expire automatiquement après 7 jours et peut être révoqué à tout moment.
        </p>
      </div>

      <button
        type="button"
        className="share-panel__create"
        onClick={handleCreate}
        disabled={creating}
      >
        {creating ? 'Création…' : 'Créer un lien de partage'}
      </button>

      {error && <p className="share-panel__error">{error}</p>}

      {loading && links.length === 0 ? (
        <p className="share-panel__loading">Chargement…</p>
      ) : links.length === 0 ? (
        <p className="share-panel__empty">Aucun lien actif pour le moment.</p>
      ) : (
        <ul className="share-panel__list">
          {links.map((l) => (
            <li key={l.id} className="share-panel__item">
              <div className="share-panel__item-row">
                <input
                  readOnly
                  className="share-panel__url"
                  value={l.share_url}
                  aria-label="URL de partage"
                />
                <button
                  type="button"
                  className="share-panel__btn"
                  onClick={() => handleCopy(l.share_url, l.token)}
                >
                  {copiedToken === l.token ? 'Copié ✓' : 'Copier'}
                </button>
                <button
                  type="button"
                  className="share-panel__btn share-panel__btn--danger"
                  onClick={() => handleRevoke(l.token)}
                >
                  Révoquer
                </button>
              </div>
              <div className="share-panel__meta">
                <span className="share-panel__badge">{l.scope}</span>
                <span>Expire le {formatDate(l.expires_at)}</span>
                <span className="share-panel__status">actif</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
