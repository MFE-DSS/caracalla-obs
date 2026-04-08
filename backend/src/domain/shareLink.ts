export type ShareLinkScope = 'premium_read' | 'premium_read_export';

export interface ShareLinkRecord {
  id: string;
  audit_id: string;
  token: string;
  scope: ShareLinkScope;
  created_at: string;
  expires_at: string;
  created_by_mode: 'owner' | 'system';
  is_active: boolean;
}
