import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ShareLinkPanel } from '../components/ShareLinkPanel';

const mockLink = {
  id: 'shl_1',
  token: 'shr_abc',
  scope: 'premium_read' as const,
  created_at: '2026-04-08T10:00:00.000Z',
  expires_at: '2026-04-15T10:00:00.000Z',
  is_active: true,
  share_url: 'http://localhost:5173/share/shr_abc',
};

function mockFetch(routes: Record<string, (init?: RequestInit) => unknown>) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    if (!key) throw new Error(`unmocked: ${url}`);
    const data = routes[key](init);
    return { ok: true, status: 200, json: async () => data } as Response;
  });
}

const writeTextMock = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeTextMock.mockClear();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
  });
});

describe('ShareLinkPanel', () => {
  it('renders the create button and empty state', async () => {
    (globalThis as { fetch: typeof fetch }).fetch = mockFetch({
      '/share-links': () => ({ audit_id: 'aud_1', links: [] }),
    }) as unknown as typeof fetch;

    render(<ShareLinkPanel auditId="aud_1" />);
    expect(screen.getByRole('button', { name: /Créer un lien/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Aucun lien actif/i)).toBeInTheDocument();
    });
  });

  it('creates a share link when the button is clicked', async () => {
    let listCalls = 0;
    (globalThis as { fetch: typeof fetch }).fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/share-links') && (!init || init.method !== 'POST')) {
        listCalls++;
        return { ok: true, status: 200, json: async () => ({ audit_id: 'aud_1', links: [] }) } as Response;
      }
      if (url.includes('/share-links') && init?.method === 'POST') {
        return { ok: true, status: 201, json: async () => mockLink } as Response;
      }
      throw new Error(`unmocked: ${url}`);
    }) as unknown as typeof fetch;

    render(<ShareLinkPanel auditId="aud_1" />);
    await waitFor(() => expect(listCalls).toBe(1));

    fireEvent.click(screen.getByRole('button', { name: /Créer un lien/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockLink.share_url)).toBeInTheDocument();
    });
    expect(screen.getByText('premium_read')).toBeInTheDocument();
  });

  it('revokes a link and removes it from the list', async () => {
    (globalThis as { fetch: typeof fetch }).fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/share-links') && (!init || init.method !== 'POST')) {
        return { ok: true, status: 200, json: async () => ({ audit_id: 'aud_1', links: [mockLink] }) } as Response;
      }
      if (url.includes('/revoke')) {
        return { ok: true, status: 200, json: async () => ({ revoked: true }) } as Response;
      }
      throw new Error(`unmocked: ${url}`);
    }) as unknown as typeof fetch;

    render(<ShareLinkPanel auditId="aud_1" />);
    await waitFor(() => expect(screen.getByDisplayValue(mockLink.share_url)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Révoquer/i }));

    await waitFor(() => {
      expect(screen.queryByDisplayValue(mockLink.share_url)).not.toBeInTheDocument();
      expect(screen.getByText(/Aucun lien actif/i)).toBeInTheDocument();
    });
  });

  it('copies the URL to clipboard when Copier is clicked', async () => {
    (globalThis as { fetch: typeof fetch }).fetch = vi.fn(async () =>
      ({ ok: true, status: 200, json: async () => ({ audit_id: 'aud_1', links: [mockLink] }) }) as Response,
    ) as unknown as typeof fetch;

    render(<ShareLinkPanel auditId="aud_1" />);
    await waitFor(() => expect(screen.getByDisplayValue(mockLink.share_url)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Copier/i }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(mockLink.share_url);
    });
  });
});
