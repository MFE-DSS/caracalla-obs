import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { SharedReportPage } from '../pages/SharedReportPage';
import { buildEngineOutputV2 } from '../engine/services/buildEngineOutputV2';
import { buildLocalPremiumReport } from '../services/localPremiumBuilder';

// Silence analytics noise in tests.
vi.mock('../analytics', () => ({
  track: vi.fn(),
  trackOnce: vi.fn(),
}));

// Build a realistic shared report payload that mirrors the backend response.
const engine = buildEngineOutputV2({
  company_name: 'Menuiserie Dupont',
  company_size_band: '21-50',
  industry_hint: 'BTP / Construction',
  pain_text:
    "Je perds du temps sur des tâches répétitives. On reçoit les demandes de devis par email, on les ressaisit dans Excel.",
});
const premiumView = buildLocalPremiumReport(engine);

const OK_PAYLOAD = {
  audit_id: 'aud_test',
  report: engine,
  premium_view: premiumView,
  shared: true,
  scope: 'premium_read',
  expires_at: '2099-01-01T00:00:00.000Z',
};

function renderAt(token: string) {
  return render(
    <MemoryRouter initialEntries={[`/share/${token}`]}>
      <Routes>
        <Route path="/share/:token" element={<SharedReportPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockFetchOnce(responder: () => Response | Promise<Response>) {
  (globalThis as unknown as { fetch: unknown }).fetch = vi.fn(async () => responder());
}

describe('SharedReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (globalThis as unknown as { fetch?: unknown }).fetch;
  });

  it('renders loading state first, then the shared report on success', async () => {
    mockFetchOnce(
      () =>
        ({
          ok: true,
          status: 200,
          json: async () => OK_PAYLOAD,
        }) as Response,
    );

    renderAt('shr_good');

    // Loading state is shown immediately
    expect(screen.getByText(/Chargement du rapport partagé/i)).toBeInTheDocument();

    // Then the premium report renders with the shared header
    await waitFor(() => {
      expect(screen.getByText('Rapport partagé')).toBeInTheDocument();
    });
    expect(screen.getByText('Vous consultez un audit partagé')).toBeInTheDocument();
    expect(screen.getByText('Lecture seule')).toBeInTheDocument();

    // Premium content is there (score badge renders /100)
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('does not render share panel nor export button in shared mode', async () => {
    mockFetchOnce(
      () =>
        ({
          ok: true,
          status: 200,
          json: async () => OK_PAYLOAD,
        }) as Response,
    );

    renderAt('shr_good');

    await waitFor(() => {
      expect(screen.getByText('Rapport partagé')).toBeInTheDocument();
    });

    // Export button owner-only action must not be rendered
    expect(screen.queryByText(/Télécharger le dossier PDF/i)).not.toBeInTheDocument();
    // Share panel section title must not be rendered
    expect(screen.queryByText('Partager ce rapport')).not.toBeInTheDocument();
    // "Rapport premium" owner badge must not be rendered
    expect(screen.queryByText('Rapport premium')).not.toBeInTheDocument();
  });

  it('renders a clear message when the share link is expired/revoked (403)', async () => {
    mockFetchOnce(
      () =>
        ({
          ok: false,
          status: 403,
          json: async () => ({ error: 'link_expired_or_revoked' }),
        }) as Response,
    );

    renderAt('shr_expired');

    await waitFor(() => {
      expect(
        screen.getByText(/Ce lien de partage n'est plus valide/i),
      ).toBeInTheDocument();
    });
  });

  it('renders a clear message when the share link is not found (404)', async () => {
    mockFetchOnce(
      () =>
        ({
          ok: false,
          status: 404,
          json: async () => ({ error: 'not_found' }),
        }) as Response,
    );

    renderAt('shr_unknown');

    await waitFor(() => {
      expect(screen.getByText(/Lien de partage introuvable/i)).toBeInTheDocument();
    });
  });

  it('renders a generic error message on network failure', async () => {
    (globalThis as unknown as { fetch: unknown }).fetch = vi.fn(async () => {
      throw new Error('network down');
    });

    renderAt('shr_err');

    await waitFor(() => {
      expect(screen.getByText(/Rapport indisponible/i)).toBeInTheDocument();
    });
  });
});
