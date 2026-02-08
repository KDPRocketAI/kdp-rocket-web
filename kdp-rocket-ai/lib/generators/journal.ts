import jsPDF from 'jspdf';
import { createPDF, PageSize, PAGE_SIZES, downloadPDF, getPageDimensionsWithBleed, MarginPreset, CustomMargins } from './pdf-utils';

export type LineSpacing = 'wide' | 'medium' | 'narrow';

interface JournalConfig {
    pageSize: PageSize;
    pageCount: number;
    spacing: LineSpacing;
    customWidth?: number;
    customHeight?: number;
    withBleed?: boolean;
    marginPreset?: MarginPreset;
    customMargins?: CustomMargins;
}

function getLineSpacing(spacing: LineSpacing, pageSize: PageSize): number {
    const base = pageSize === '5.5x8.5' ? 20 : 24;

    switch (spacing) {
        case 'wide': return base;
        case 'medium': return base * 0.75;
        case 'narrow': return base * 0.6;
    }
}

function drawJournalPage(pdf: jsPDF, pageSize: PageSize, lineSpacing: number, pageNum: number, customWidth?: number, customHeight?: number, withBleed: boolean = false, marginPreset?: MarginPreset, customMargins?: CustomMargins): void {
    const dimensions = getPageDimensionsWithBleed(
        pageSize, customWidth, customHeight, withBleed,
        marginPreset || 'kdp-default',
        customMargins
    );

    // Use KDP-compliant margins - alternate based on page number
    const isOddPage = pageNum % 2 === 1;
    const leftMargin = isOddPage ? dimensions.marginInside : dimensions.marginOutside;
    const rightMargin = isOddPage ? dimensions.marginOutside : dimensions.marginInside;

    const startY = dimensions.marginTop;
    const endY = dimensions.height - dimensions.marginBottom;
    const startX = leftMargin;
    const endX = dimensions.width - rightMargin;

    // Draw lines
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(200, 200, 200);

    let y = startY;
    while (y <= endY) {
        pdf.line(startX, y, endX, y);
        y += lineSpacing;
    }

    // Optional: Add page number at bottom
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(`${pageNum}`, dimensions.width / 2, dimensions.height - dimensions.marginBottom / 2, { align: 'center' });
}

export function generateJournalPDF(config: JournalConfig): jsPDF {
    const pdf = createPDF(config.pageSize, config.customWidth, config.customHeight, config.withBleed);
    const lineSpacing = getLineSpacing(config.spacing, config.pageSize);

    for (let page = 1; page <= config.pageCount; page++) {
        if (page > 1) {
            pdf.addPage();
        }

        drawJournalPage(pdf, config.pageSize, lineSpacing, page, config.customWidth, config.customHeight, config.withBleed, config.marginPreset, config.customMargins);
    }

    return pdf;
}

export function downloadJournalPDF(config: JournalConfig) {
    const pdf = generateJournalPDF(config);
    downloadPDF(pdf, `journal-lined-${config.spacing}.pdf`);
}
