import PDFDocument from 'pdfkit';

export interface Apl02ExportUnit {
  kode: string;
  nama: string;
  pernyataan: string;
  buktKompetensi: string[];
  statusMandiri: string;
  catatan: string;
}

export interface Apl02ExportDraft {
  namaAsesi: string;
  jabatan: string;
  tanggalDibuat: string;
  ringkasan: string;
  units: Apl02ExportUnit[];
  disclaimer: string;
}

const PAGE_MARGIN = 42;
const FOOTER_RESERVED_SPACE = 62;
const TABLE_FONT_SIZE = 8.5;
const TABLE_LINE_GAP = 2;

function pdfText(value: string): string {
  // The built-in Helvetica font uses WinAnsi encoding. Replace common
  // typography from AI responses so one unusual character cannot break export.
  return value
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[•▪]/g, '-')
    .replace(/[✓✅]/g, '[x]')
    .replace(/[□☐]/g, '[ ]')
    .replace(/[^\x00-\xff]/g, '');
}

function contentWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function contentBottom(doc: PDFKit.PDFDocument): number {
  return doc.page.height - FOOTER_RESERVED_SPACE;
}

function drawPageHeader(doc: PDFKit.PDFDocument): void {
  const left = doc.page.margins.left;
  const width = contentWidth(doc);
  const top = doc.page.margins.top;

  doc.save();
  doc.fillColor('#1f2937').rect(left, top, width, 54).fill();
  doc.fillColor('#ffffff').font('Helvetica').fontSize(7.5)
    .text('FORMULIR ASESMEN MANDIRI', left + 14, top + 9, { characterSpacing: 1.3 });
  doc.font('Helvetica-Bold').fontSize(17)
    .text('FR.APL.02', left + 14, top + 20);
  doc.font('Helvetica').fontSize(8.5)
    .text('Asesmen Mandiri Calon Tenaga Ahli SKK', left + 105, top + 27);
  doc.fontSize(8).text('Ref: BNSP / LSP Konstruksi', left + width - 150, top + 13, {
    width: 136,
    align: 'right',
  });
  doc.restore();
  doc.y = top + 70;
}

function ensureSpace(doc: PDFKit.PDFDocument, height: number): boolean {
  if (doc.y + height <= contentBottom(doc)) return false;
  doc.addPage();
  drawPageHeader(doc);
  return true;
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  ensureSpace(doc, 28);
  const left = doc.page.margins.left;
  const width = contentWidth(doc);
  doc.fillColor('#374151').font('Helvetica-Bold').fontSize(9)
    .text(pdfText(title), left, doc.y, { width });
  doc.moveTo(left, doc.y + 14).lineTo(left + width, doc.y + 14)
    .lineWidth(0.7).strokeColor('#9ca3af').stroke();
  doc.y += 24;
}

function rowHeight(
  doc: PDFKit.PDFDocument,
  values: string[],
  widths: number[],
  minHeight = 26,
): number {
  const height = values.reduce((max, value, index) => {
    const measured = doc.heightOfString(pdfText(value), {
      width: Math.max(widths[index] - 10, 10),
      lineGap: TABLE_LINE_GAP,
    });
    return Math.max(max, measured);
  }, 0);
  return Math.max(minHeight, height + 10);
}

function drawTableCell(
  doc: PDFKit.PDFDocument,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { bold?: boolean; color?: string; align?: 'left' | 'center' | 'right' } = {},
): void {
  doc.fillColor(options.color ?? '#111827')
    .font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(TABLE_FONT_SIZE)
    .text(pdfText(value), x + 5, y + 5, {
      width: width - 10,
      height: height - 8,
      lineGap: TABLE_LINE_GAP,
      align: options.align ?? 'left',
    });
}

function drawTableHeader(doc: PDFKit.PDFDocument, labels: string[], widths: number[]): void {
  const left = doc.page.margins.left;
  const height = 27;
  const y = doc.y;
  let x = left;

  doc.fillColor('#e5e7eb').rect(left, y, widths.reduce((sum, width) => sum + width, 0), height).fill();
  labels.forEach((label, index) => {
    doc.rect(x, y, widths[index], height).lineWidth(0.5).strokeColor('#9ca3af').stroke();
    drawTableCell(doc, label, x, y, widths[index], height, {
      bold: true,
      color: '#374151',
      align: index === 0 ? 'center' : 'left',
    });
    x += widths[index];
  });
  doc.y = y + height;
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  values: string[],
  widths: number[],
  options: { shaded?: boolean; boldColumns?: number[] } = {},
): void {
  const height = rowHeight(doc, values, widths);
  ensureSpace(doc, height + 2);
  paintTableRow(doc, values, widths, height, options);
}

function paintTableRow(
  doc: PDFKit.PDFDocument,
  values: string[],
  widths: number[],
  height: number,
  options: { shaded?: boolean; boldColumns?: number[] } = {},
): void {
  const left = doc.page.margins.left;
  const y = doc.y;
  let x = left;
  values.forEach((value, index) => {
    if (options.shaded) {
      doc.fillColor('#f9fafb').rect(x, y, widths[index], height).fill();
    }
    doc.rect(x, y, widths[index], height).lineWidth(0.5).strokeColor('#9ca3af').stroke();
    drawTableCell(doc, value, x, y, widths[index], height, {
      bold: options.boldColumns?.includes(index),
      align: index === 0 ? 'center' : 'left',
    });
    x += widths[index];
  });
  doc.y = y + height;
}

function splitTextToHeight(
  doc: PDFKit.PDFDocument,
  value: string,
  width: number,
  maxHeight: number,
): { current: string; remaining: string } {
  const text = pdfText(value).trim();
  if (!text) return { current: '-', remaining: '' };
  if (doc.heightOfString(text, { width, lineGap: TABLE_LINE_GAP }) <= maxHeight) {
    return { current: text, remaining: '' };
  }

  let low = 1;
  let high = text.length;
  let best = 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = text.slice(0, middle);
    const height = doc.heightOfString(candidate, { width, lineGap: TABLE_LINE_GAP });
    if (height <= maxHeight) {
      best = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  let cut = best;
  const boundary = Math.max(text.lastIndexOf('\n', best), text.lastIndexOf(' ', best));
  if (boundary >= Math.floor(best * 0.7)) cut = boundary;
  return {
    current: text.slice(0, cut).trimEnd(),
    remaining: text.slice(cut).trimStart(),
  };
}

function drawIdentityTable(
  doc: PDFKit.PDFDocument,
  draft: Apl02ExportDraft,
  pendidikan: string,
  pengalaman: string,
): void {
  const widths = [145, contentWidth(doc) - 145];
  drawTableHeader(doc, ['Data Asesi', 'Keterangan'], widths);
  const rows = [
    ['Nama Lengkap', draft.namaAsesi],
    ['Jabatan Diajukan', draft.jabatan],
    ['Pendidikan Terakhir', pendidikan || '-'],
    ['Pengalaman Kerja', pengalaman || '-'],
    ['Tanggal Dokumen', draft.tanggalDibuat],
  ];
  rows.forEach((row, index) => {
    drawTableRow(doc, row, widths, { shaded: index % 2 === 1, boldColumns: [0] });
  });
  doc.y += 18;
}

function unitEvidence(unit: Apl02ExportUnit): string {
  const evidence = unit.buktKompetensi.length
    ? unit.buktKompetensi.map((item) => `- ${item}`).join('\n')
    : '- Belum dicantumkan';
  const notes = unit.catatan ? `\n\nCatatan: ${unit.catatan}` : '';
  return `Pernyataan Mandiri:\n${unit.pernyataan || '-'}\n\nBukti Kompetensi:\n${evidence}${notes}`;
}

function drawUnitsTable(doc: PDFKit.PDFDocument, units: Apl02ExportUnit[]): void {
  const widths = [25, 78, 132, 211, 65];
  const labels = ['No', 'Kode', 'Unit Kompetensi', 'Pernyataan dan Bukti', 'Status'];
  drawTableHeader(doc, labels, widths);

  units.forEach((unit, index) => {
    let remaining = unitEvidence(unit);
    let firstPart = true;

    while (remaining) {
      const firstValues = [
        String(index + 1),
        unit.kode,
        unit.nama,
        '',
        unit.statusMandiri || 'Belum dinilai',
      ];
      const continuationValues = ['', '', `${unit.nama} (lanjutan)`, '', 'Lanjutan'];
      const metadataValues = firstPart ? firstValues : continuationValues;
      const metadataHeight = rowHeight(doc, metadataValues, widths);
      const minimumHeight = Math.max(metadataHeight, 50);

      if (doc.y + minimumHeight > contentBottom(doc)) {
        doc.addPage();
        drawPageHeader(doc);
        drawSectionTitle(doc, 'C. DAFTAR UNIT KOMPETENSI DAN ASESMEN MANDIRI (lanjutan)');
        drawTableHeader(doc, labels, widths);
      }

      const availableHeight = contentBottom(doc) - doc.y;
      const detail = splitTextToHeight(
        doc,
        remaining,
        widths[3] - 10,
        Math.max(availableHeight - 10, 20),
      );
      const values = [...metadataValues];
      values[3] = detail.current;
      const height = Math.max(metadataHeight, rowHeight(doc, values, widths));
      paintTableRow(doc, values, widths, height, { shaded: index % 2 === 1 });

      remaining = detail.remaining;
      firstPart = false;
      if (remaining) {
        doc.addPage();
        drawPageHeader(doc);
        drawSectionTitle(doc, 'C. DAFTAR UNIT KOMPETENSI DAN ASESMEN MANDIRI (lanjutan)');
        drawTableHeader(doc, labels, widths);
      }
    }
  });
  doc.y += 18;
}

function drawSignatureSection(doc: PDFKit.PDFDocument, draft: Apl02ExportDraft): void {
  const left = doc.page.margins.left;
  const width = contentWidth(doc);
  const gap = 16;
  const boxWidth = (width - gap) / 2;
  const boxHeight = 116;
  doc.font('Helvetica').fontSize(8.5);
  const disclaimerHeight = doc.heightOfString(pdfText(draft.disclaimer), {
    width,
    lineGap: 2,
  });
  const requiredHeight = 23 + disclaimerHeight + 14 + boxHeight + 28;

  ensureSpace(doc, requiredHeight);
  doc.fillColor('#374151').font('Helvetica-Bold').fontSize(9)
    .text('D. PERNYATAAN DAN TANDA TANGAN', left, doc.y, { width });
  doc.moveTo(left, doc.y + 14).lineTo(left + width, doc.y + 14)
    .lineWidth(0.7).strokeColor('#9ca3af').stroke();
  doc.y += 23;
  doc.fillColor('#374151').font('Helvetica').fontSize(8.5)
    .text(pdfText(draft.disclaimer), left, doc.y, { width, lineGap: 2 });
  doc.y += 14;

  const y = doc.y;
  [0, 1].forEach((index) => {
    const x = left + index * (boxWidth + gap);
    doc.rect(x, y, boxWidth, boxHeight).lineWidth(0.6).strokeColor('#9ca3af').stroke();
    doc.fillColor('#6b7280').font('Helvetica').fontSize(8.5)
      .text(index === 0 ? 'Tanda tangan Asesi:' : 'Tanda tangan Asesor:', x + 10, y + 10, {
        width: boxWidth - 20,
      });
    doc.moveTo(x + 10, y + 78).lineTo(x + boxWidth - 10, y + 78)
      .lineWidth(0.6).strokeColor('#6b7280').stroke();
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.5)
      .text(index === 0 ? pdfText(draft.namaAsesi) : '________________________', x + 10, y + 84, {
        width: boxWidth - 20,
      });
    doc.fillColor('#6b7280').font('Helvetica').fontSize(7.5)
      .text(index === 0 ? 'Asesi' : 'Asesor BNSP yang ditunjuk LSP', x + 10, y + 98, {
        width: boxWidth - 20,
      });
  });
  doc.y = y + boxHeight + 14;
  doc.fillColor('#6b7280').font('Helvetica').fontSize(7.5)
    .text(`Tanggal: ${pdfText(draft.tanggalDibuat)}`, left, doc.y, { width });
}

export function createApl02Pdf(
  draft: Apl02ExportDraft,
  pendidikan: string,
  pengalaman: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
      bufferPages: true,
      info: {
        Title: `FR.APL.02 - ${draft.namaAsesi}`,
        Author: 'SIAP Certify',
        Subject: 'Formulir Asesmen Mandiri',
      },
    });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    drawPageHeader(doc);
    doc.fillColor('#374151').font('Helvetica').fontSize(8.5)
      .text(`Tanggal dibuat: ${pdfText(draft.tanggalDibuat)}`, PAGE_MARGIN, doc.y, {
        width: contentWidth(doc),
        align: 'right',
      });
    doc.y += 17;

    drawSectionTitle(doc, 'A. IDENTITAS ASESI');
    drawIdentityTable(doc, draft, pendidikan, pengalaman);

    drawSectionTitle(doc, 'B. PROFIL KOMPETENSI SINGKAT');
    ensureSpace(doc, 42);
    doc.fillColor('#374151').font('Helvetica').fontSize(9)
      .text(pdfText(draft.ringkasan || '-'), PAGE_MARGIN, doc.y, {
        width: contentWidth(doc),
        lineGap: 2,
      });
    doc.y += 18;

    drawSectionTitle(doc, 'C. DAFTAR UNIT KOMPETENSI DAN ASESMEN MANDIRI');
    drawUnitsTable(doc, draft.units);
    drawSignatureSection(doc, draft);

    const range = doc.bufferedPageRange();
    for (let index = 0; index < range.count; index += 1) {
      doc.switchToPage(range.start + index);
      doc.fillColor('#6b7280').font('Helvetica').fontSize(7)
        .text(
          `FR.APL.02 | Halaman ${index + 1} dari ${range.count}`,
          PAGE_MARGIN,
          doc.page.height - doc.page.margins.bottom - 13,
          {
          width: contentWidth(doc),
          align: 'center',
          lineBreak: false,
          },
        );
    }
    doc.flushPages();
    doc.end();
  });
}