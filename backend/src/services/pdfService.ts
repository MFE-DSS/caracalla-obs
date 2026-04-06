import PDFDocument from 'pdfkit';
import type { ExportReportViewModel } from '../domain/exportReport.js';

// ── Colors ─────────────────────────────────────────────
const COLOR_PRIMARY = '#1B2A4A';
const COLOR_ACCENT = '#E8913A';
const COLOR_GRAY = '#5A6270';
const COLOR_LIGHT_GRAY = '#9BA3B0';
const COLOR_BORDER = '#E2E6ED';
const COLOR_BG_LIGHT = '#F8F9FA';
const COLOR_GREEN = '#10B981';
const COLOR_WARNING = '#F59E0B';
const COLOR_RED = '#EF4444';

// ── Helpers ────────────────────────────────────────────
function drawSeparator(doc: PDFKit.PDFDocument, y: number): void {
  doc.moveTo(50, y).lineTo(545, y).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc.fontSize(14).fillColor(COLOR_PRIMARY).font('Helvetica-Bold').text(title, 50, undefined, { width: 495 });
  doc.moveDown(0.3);
}

function bodyText(doc: PDFKit.PDFDocument, text: string, options?: { indent?: number; color?: string }): void {
  doc.fontSize(10).fillColor(options?.color ?? COLOR_GRAY).font('Helvetica')
    .text(text, 50 + (options?.indent ?? 0), undefined, { width: 495 - (options?.indent ?? 0), lineGap: 3 });
}

function badge(doc: PDFKit.PDFDocument, text: string, color: string): void {
  doc.fontSize(8).fillColor(color).font('Helvetica-Bold').text(text.toUpperCase(), { continued: true });
  doc.text('  ', { continued: false });
}

function checkPageSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed > 750) {
    doc.addPage();
  }
}

// ── Main ───────────────────────────────────────────────

export function generatePdf(report: ExportReportViewModel): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      info: {
        Title: `${report.report_title} — ${report.company_name}`,
        Author: 'Caracalla',
        Subject: 'Diagnostic opérationnel premium',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Page 1: Cover ────────────────────────────────
    doc.moveDown(6);
    doc.fontSize(28).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
      .text('Caracalla', 50, undefined, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor(COLOR_GRAY).font('Helvetica')
      .text(report.report_title, { align: 'center' });
    doc.moveDown(2);

    drawSeparator(doc, doc.y);
    doc.moveDown(1.5);

    doc.fontSize(20).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
      .text(report.company_name, { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor(COLOR_GRAY).font('Helvetica')
      .text(`Score de maturité : ${report.global_score}/100 — ${report.global_level}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor(COLOR_LIGHT_GRAY).font('Helvetica')
      .text(`Généré le ${new Date(report.meta.generated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'center' });

    doc.moveDown(4);
    drawSeparator(doc, doc.y);
    doc.moveDown(1);

    doc.fontSize(9).fillColor(COLOR_LIGHT_GRAY).font('Helvetica')
      .text('Document confidentiel — à usage du destinataire uniquement', { align: 'center' });

    // ── Page 2: Executive Verdict ─────────────────────
    doc.addPage();
    const v = report.premium.executive_verdict;

    sectionTitle(doc, 'Verdict exécutif');
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
      .text(v.headline, 50, undefined, { width: 495, lineGap: 3 });
    doc.moveDown(0.5);
    bodyText(doc, v.subheadline);
    doc.moveDown(0.5);

    doc.fontSize(9).fillColor(COLOR_LIGHT_GRAY).font('Helvetica')
      .text(`Thème dominant : ${v.dominant_theme}  |  Retour estimé : ${v.time_to_value_hint}  |  Confiance : ${v.confidence}`, 50, undefined, { width: 495 });

    doc.moveDown(1.5);
    drawSeparator(doc, doc.y);
    doc.moveDown(1);

    // Decision summary
    bodyText(doc, report.premium.decision_summary);
    doc.moveDown(1.5);
    drawSeparator(doc, doc.y);
    doc.moveDown(1);

    // ── Top Action ──────────────────────────────────
    const top = report.premium.top_opportunity;
    if (top) {
      sectionTitle(doc, 'Ce qu\'il faut faire en premier');
      doc.moveDown(0.3);

      doc.fontSize(11).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
        .text(`#${top.rank}  ${top.title}`, 50, undefined, { width: 495 });
      doc.moveDown(0.3);

      bodyText(doc, top.why_it_matters);
      doc.moveDown(0.3);

      if (top.why_now && top.why_now !== top.why_it_matters) {
        doc.fontSize(9).fillColor(COLOR_ACCENT).font('Helvetica-Bold').text('Pourquoi maintenant : ', 50, undefined, { continued: true });
        doc.font('Helvetica').fillColor(COLOR_GRAY).text(top.why_now);
        doc.moveDown(0.3);
      }

      doc.fontSize(9).fillColor(COLOR_LIGHT_GRAY).font('Helvetica')
        .text(`Valeur : ${top.value_label}  |  Effort : ${top.effort_label}  |  Risque : ${top.risk_label}`);
      if (top.archetype_label) {
        doc.text(`Forme de travail : ${top.archetype_label}  |  Friction : ${top.dominant_friction_label}`);
      }

      doc.moveDown(1.5);
      drawSeparator(doc, doc.y);
      doc.moveDown(1);
    }

    // ── Priority Board ──────────────────────────────
    const otherOpps = report.premium.priority_board.slice(1);
    if (otherOpps.length > 0) {
      checkPageSpace(doc, 150);
      sectionTitle(doc, 'Autres pistes classées par priorité');
      doc.moveDown(0.3);

      for (const opp of otherOpps) {
        checkPageSpace(doc, 80);
        doc.fontSize(10).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
          .text(`#${opp.rank}  ${opp.title}`, 50, undefined, { width: 495 });
        doc.moveDown(0.2);
        bodyText(doc, opp.why_it_matters, { indent: 10 });
        doc.fontSize(9).fillColor(COLOR_LIGHT_GRAY).font('Helvetica')
          .text(`${opp.priority_label}  |  Valeur : ${opp.value_label}  |  Effort : ${opp.effort_label}`, 60, undefined, { width: 485 });
        doc.moveDown(0.7);
      }

      doc.moveDown(0.5);
      drawSeparator(doc, doc.y);
      doc.moveDown(1);
    }

    // ── Prerequisites ───────────────────────────────
    if (report.premium.prerequisites_board.length > 0) {
      checkPageSpace(doc, 100);
      sectionTitle(doc, 'Ce qui doit être en place d\'abord');
      doc.moveDown(0.3);

      for (const p of report.premium.prerequisites_board) {
        doc.fontSize(9).fillColor(COLOR_WARNING).font('Helvetica-Bold')
          .text(`[${p.category}]`, 50, undefined, { continued: true, width: 80 });
        doc.font('Helvetica').fillColor(COLOR_GRAY).text(`  ${p.label}`, { width: 415 });
        doc.moveDown(0.2);
      }

      doc.moveDown(1);
      drawSeparator(doc, doc.y);
      doc.moveDown(1);
    }

    // ── Blocked Items ───────────────────────────────
    if (report.premium.blocked_items_board.length > 0) {
      checkPageSpace(doc, 100);
      sectionTitle(doc, 'Ce qui serait prématuré à ce stade');
      doc.moveDown(0.3);

      for (const b of report.premium.blocked_items_board) {
        doc.fontSize(10).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
          .text(b.title, 50, undefined, { width: 495 });
        bodyText(doc, `Raison : ${b.why_blocked}`, { indent: 10 });
        bodyText(doc, `Condition : ${b.unblock_condition}`, { indent: 10, color: COLOR_ACCENT });
        doc.moveDown(0.5);
      }

      doc.moveDown(0.5);
      drawSeparator(doc, doc.y);
      doc.moveDown(1);
    }

    // ── Execution Plan ──────────────────────────────
    if (report.premium.execution_plan_board.length > 0) {
      checkPageSpace(doc, 150);
      sectionTitle(doc, 'Plan d\'exécution recommandé');
      doc.moveDown(0.3);

      for (const step of report.premium.execution_plan_board) {
        checkPageSpace(doc, 70);
        const kindColor = step.kind === 'prerequisite' ? COLOR_WARNING : step.kind === 'pilot' ? COLOR_GREEN : COLOR_LIGHT_GRAY;

        doc.fontSize(10).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
          .text(`Étape ${step.step_number}`, 50, undefined, { continued: true });
        doc.fontSize(8).fillColor(kindColor).font('Helvetica-Bold')
          .text(`  [${step.kind_label}]`, { continued: false });
        doc.moveDown(0.1);

        doc.fontSize(10).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
          .text(step.title, 60, undefined, { width: 485 });
        doc.moveDown(0.2);
        bodyText(doc, step.why, { indent: 10 });
        doc.fontSize(9).fillColor(COLOR_LIGHT_GRAY).font('Helvetica')
          .text(`Retour estimé : ${step.time_to_value}${step.unlocks_count > 0 ? `  |  Débloque ${step.unlocks_count} action(s)` : ''}`, 60, undefined, { width: 485 });
        doc.moveDown(0.7);
      }

      doc.moveDown(0.5);
      drawSeparator(doc, doc.y);
      doc.moveDown(1);
    }

    // ── Advisory CTA ────────────────────────────────
    checkPageSpace(doc, 120);
    const cta = report.premium.advisory_cta_block;

    sectionTitle(doc, cta.headline);
    doc.moveDown(0.3);

    for (const reason of cta.reasons) {
      doc.fontSize(10).fillColor(COLOR_ACCENT).font('Helvetica').text(`→  ${reason}`, 60, undefined, { width: 485 });
      doc.moveDown(0.2);
    }
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
      .text(cta.cta_label, 50, undefined, { width: 495, align: 'center' });

    // ── Footer ──────────────────────────────────────
    doc.moveDown(3);
    drawSeparator(doc, doc.y);
    doc.moveDown(0.5);
    doc.fontSize(7).fillColor(COLOR_LIGHT_GRAY).font('Helvetica')
      .text(report.footer_note, 50, undefined, { width: 495, align: 'center' });

    doc.end();
  });
}
