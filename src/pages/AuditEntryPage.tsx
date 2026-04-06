import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AuditPage } from './AuditPage';
import { submitAudit } from '../api';
import { saveSession } from '../services/session';

export function AuditEntryPage() {
  const navigate = useNavigate();
  const [, setSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, string>) => {
    setSubmitting(true);
    const result = await submitAudit({
      company: data.company || '',
      sector: data.sector || '',
      size: data.size || '',
      pain: data.pain || '',
    });
    saveSession(result.audit_id, false, 'summary');
    navigate(`/audit/${result.audit_id}/summary`);
  };

  return (
    <AuditPage
      onSubmit={handleSubmit}
      onBack={() => navigate('/')}
    />
  );
}
