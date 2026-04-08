import type { Request, Response } from 'express';
import { getAudit, getAuditOutput } from '../services/auditService.js';
import { buildPremiumReport } from '../services/premiumReportBuilder.js';
import { buildExportReport } from '../services/exportReportBuilder.js';
import { generatePdf } from '../services/pdfService.js';
import { verifyAccessToken } from '../services/accessTokenService.js';
import { recordEvent } from '../services/eventService.js';
import type { EngineOutputV2 } from '../../../src/engine/domain/arbitration.js';

function extractToken(req: Request): string | null {
  const q = req.query.token;
  if (typeof q === 'string' && q) return q;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function handleExportPdf(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const audit = getAudit(id);
  if (!audit) {
    res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
    return;
  }

  // Token-based access check
  const token = extractToken(req);
  if (token) {
    const payload = verifyAccessToken(token, 'export_access', id) ?? verifyAccessToken(token, 'premium_access', id);
    if (!payload) {
      recordEvent({ audit_id: id, event_type: 'invalid_token_attempt', surface: 'api', payload: { target: 'export' } });
      recordEvent({ audit_id: id, event_type: 'report_access_denied', surface: 'api', payload: { reason: 'invalid_token', target: 'export' } });
      res.status(403).json({ error: 'invalid_token', message: 'Lien invalide ou expiré.' });
      return;
    }
  }

  if (!audit.paid) {
    recordEvent({ audit_id: id, event_type: 'report_access_denied', surface: 'api', payload: { reason: 'premium_locked', target: 'export' } });
    res.status(402).json({
      error: 'premium_locked',
      message: 'Le rapport PDF nécessite un déverrouillage premium.',
      audit_id: id,
    });
    return;
  }

  const output = getAuditOutput(id);
  if (!output) {
    res.status(404).json({ error: 'not_found', message: 'Résultats du diagnostic non trouvés.' });
    return;
  }

  try {
    const engineOutput: EngineOutputV2 = JSON.parse(output.report_payload);
    const premiumView = buildPremiumReport(engineOutput);
    const exportViewModel = buildExportReport(id, engineOutput, premiumView);
    const pdfBuffer = await generatePdf(exportViewModel);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="caracalla-report-${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    recordEvent({ audit_id: id, event_type: 'premium_exported', actor_mode: 'owner', surface: 'web' });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'export_error', message: 'Erreur lors de la génération du PDF.' });
  }
}
