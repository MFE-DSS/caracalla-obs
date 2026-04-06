import { describe, it, expect, vi, beforeEach } from 'vitest';
import { track, trackOnce } from '../analytics';

describe('analytics', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('logs events with correct structure', () => {
    track('landing_viewed');
    expect(console.log).toHaveBeenCalledWith(
      '[analytics]',
      expect.objectContaining({
        event: 'landing_viewed',
        session_id: expect.any(String),
        device_type: expect.any(String),
        timestamp: expect.any(String),
      })
    );
  });

  it('includes custom payload', () => {
    track('landing_cta_clicked', { cta_position: 'hero' });
    expect(console.log).toHaveBeenCalledWith(
      '[analytics]',
      expect.objectContaining({
        event: 'landing_cta_clicked',
        cta_position: 'hero',
      })
    );
  });

  it('trackOnce fires only once per key', () => {
    trackOnce('test-once-key', 'score_viewed');
    trackOnce('test-once-key', 'score_viewed');
    // First call + the track from the first test = we check the specific call count
    const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls.filter(
      (c: unknown[]) => (c[1] as Record<string, unknown>)?.event === 'score_viewed'
    );
    expect(calls.length).toBe(1);
  });
});
