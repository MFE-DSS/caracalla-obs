import type { Request, Response } from 'express';
import { getAudit, getAuditOutput } from '../services/auditService.js';
import { buildPremiumReport } from '../services/premiumReportBuilder.js';
import { buildExportReport } from '../services/exportReportBuilder.js';
import { generatePdf } from '../services/pdfService.js';
import type { EngineOutputV2 } from '../../../src/engine/domain/arbitration.js';

export async function handleExportPdf(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const audit = getAudit(id);
  if (!audit) {
    res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
    return;
  }

  if (!audit.paid) {
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
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'export_error', message: 'Erreur lors de la génération du PDF.' });
  }
}
