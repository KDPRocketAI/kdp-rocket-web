import jsPDF from 'jspdf';
import { createPDF, PageSize, PAGE_SIZES, downloadPDF, getPageDimensionsWithBleed, MarginPreset, CustomMargins } from './pdf-utils';

export type DotSpacing = '5mm' | '6mm' | '8mm';

interface DotGridConfig {
    pageSize: PageSize;
    pageCount: number;
    spacing: DotSpacing;
    customWidth?: number;
    customHeight?: number;
    withBleed?: boolean;
    marginPreset?: MarginPreset;
    customMargins?: CustomMargins;
}

function getDotSpacingInPoints(spacing: DotSpacing): number {
    // Convert mm to points (1 mm ≈ 2.83465 points)
    switch (spacing) {
        case '5mm': return 5 * 2.83465;    // ~14.17 points
        case '6mm': return 6 * 2.83465;    // ~17 points
        case '8mm': return 8 * 2.83465;    // ~22.68 points
    }
}

function drawDotGridPage(pdf: jsPDF, pageSize: PageSize, dotSpacing: number, pageNum: number, customWidth?: number, customHeight?: number, withBleed: boolean = false, marginPreset?: MarginPreset, customMargins?: CustomMargins): void {
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

    // Draw dots
    pdf.setFillColor(180, 180, 180);
    const dotRadius = 0.5;

    let y = startY;
    while (y <= endY) {
        let x = startX;
        while (x <= endX) {
            pdf.circle(x, y, dotRadius, 'F');
            x += dotSpacing;
        }
        y += dotSpacing;
    }

    // Optional: Add page number at bottom
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(`${pageNum}`, dimensions.width / 2, dimensions.height - dimensions.marginBottom / 2, { align: 'center' });
}

export function generateDotGridPDF(config: DotGridConfig): jsPDF {
    const pdf = createPDF(config.pageSize, config.customWidth, config.customHeight, config.withBleed);
    const dotSpacing = getDotSpacingInPoints(config.spacing);

    for (let page = 1; page <= config.pageCount; page++) {
        if (page > 1) {
            pdf.addPage();
        }

        drawDotGridPage(pdf, config.pageSize, dotSpacing, page, config.customWidth, config.customHeight, config.withBleed, config.marginPreset, config.customMargins);
    }

    return pdf;
}

export function downloadDotGridPDF(config: DotGridConfig) {
    const pdf = generateDotGridPDF(config);
    downloadPDF(pdf, `dot-grid-${config.spacing}.pdf`);
}
