import jsPDF from 'jspdf';

export type PageSize = '8.5x11' | '8x11' | '8x10' | '7.5x9.25' | '7x10' | '6x9' | '5.5x8.5' | '5x8' | 'custom';
export type MarginPreset = 'kdp-default' | 'narrow' | 'wide' | 'custom';

export interface CustomMargins {
    inside: number;    // Binding margin in inches
    outside: number;   // Outside margin in inches
    top: number;       // Top margin in inches
    bottom: number;    // Bottom margin in inches
}

export interface PageDimensions {
    width: number;
    height: number;
    marginTop: number;
    marginBottom: number;
    marginOutside: number;
    marginInside: number; // Binding/gutter margin
}

// Margin presets in inches
export const MARGIN_PRESETS: Record<MarginPreset, Omit<CustomMargins, never>> = {
    'kdp-default': {
        inside: 0.625,   // Larger binding margin
        outside: 0.5,
        top: 0.5,
        bottom: 0.5
    },
    'narrow': {
        inside: 0.5,
        outside: 0.375,
        top: 0.375,
        bottom: 0.375
    },
    'wide': {
        inside: 0.875,
        outside: 0.75,
        top: 0.75,
        bottom: 0.75
    },
    'custom': {
        inside: 0.625,
        outside: 0.5,
        top: 0.5,
        bottom: 0.5
    }
};

// Get margins based on preset or custom values
export function getMargins(preset: MarginPreset, customMargins?: CustomMargins): CustomMargins {
    if (preset === 'custom' && customMargins) {
        return customMargins;
    }
    return MARGIN_PRESETS[preset];
}

// Convert inches to points (1 inch = 72 points)
function inchesToPoints(inches: number): number {
    return inches * 72;
}

// KDP-ready page dimensions in inches, converted to jsPDF points (1 inch = 72 points)
// KDP requires larger inside margin for binding
export const PAGE_SIZES: Record<Exclude<PageSize, 'custom'>, PageDimensions> = {
    '8.5x11': {
        width: 8.5 * 72,         // 612 points
        height: 11 * 72,         // 792 points
        marginTop: 0.5 * 72,     // 36 points (0.5 inch)
        marginBottom: 0.5 * 72,  // 36 points (0.5 inch)
        marginOutside: 0.5 * 72, // 36 points (0.5 inch)
        marginInside: 0.75 * 72  // 54 points (0.75 inch for binding)
    },
    '8x11': {
        width: 8 * 72,           // 576 points
        height: 11 * 72,         // 792 points
        marginTop: 0.5 * 72,
        marginBottom: 0.5 * 72,
        marginOutside: 0.5 * 72,
        marginInside: 0.75 * 72
    },
    '8x10': {
        width: 8 * 72,           // 576 points
        height: 10 * 72,         // 720 points
        marginTop: 0.5 * 72,
        marginBottom: 0.5 * 72,
        marginOutside: 0.5 * 72,
        marginInside: 0.75 * 72
    },
    '7.5x9.25': {
        width: 7.5 * 72,         // 540 points
        height: 9.25 * 72,       // 666 points
        marginTop: 0.5 * 72,
        marginBottom: 0.5 * 72,
        marginOutside: 0.5 * 72,
        marginInside: 0.75 * 72
    },
    '7x10': {
        width: 7 * 72,           // 504 points
        height: 10 * 72,         // 720 points
        marginTop: 0.5 * 72,
        marginBottom: 0.5 * 72,
        marginOutside: 0.5 * 72,
        marginInside: 0.625 * 72
    },
    '6x9': {
        width: 6 * 72,           // 432 points
        height: 9 * 72,          // 648 points
        marginTop: 0.5 * 72,
        marginBottom: 0.5 * 72,
        marginOutside: 0.5 * 72,
        marginInside: 0.625 * 72 // 0.625 inch for smaller format
    },
    '5.5x8.5': {
        width: 5.5 * 72,         // 396 points
        height: 8.5 * 72,        // 612 points
        marginTop: 0.5 * 72,
        marginBottom: 0.5 * 72,
        marginOutside: 0.4 * 72, // Slightly smaller
        marginInside: 0.625 * 72 // 0.625 inch for smaller format
    },
    '5x8': {
        width: 5 * 72,           // 360 points
        height: 8 * 72,          // 576 points
        marginTop: 0.4 * 72,
        marginBottom: 0.4 * 72,
        marginOutside: 0.375 * 72,
        marginInside: 0.5 * 72
    }
};

/**
 * Calculate KDP-compliant margins for custom page sizes
 */
export function getCustomPageDimensions(widthInches: number, heightInches: number): PageDimensions {
    const width = widthInches * 72;
    const height = heightInches * 72;

    // Calculate margins based on page size
    // Smaller pages need proportionally smaller margins
    const avgDimension = (widthInches + heightInches) / 2;

    let marginTop = 0.5 * 72;
    let marginBottom = 0.5 * 72;
    let marginOutside = 0.5 * 72;
    let marginInside = 0.75 * 72;

    // Adjust for very small pages
    if (avgDimension < 6.5) {
        marginTop = 0.4 * 72;
        marginBottom = 0.4 * 72;
        marginOutside = 0.4 * 72;
        marginInside = 0.625 * 72;
    }

    return {
        width,
        height,
        marginTop,
        marginBottom,
        marginOutside,
        marginInside
    };
}

/**
 * Get page dimensions with optional bleed
 * Bleed adds 0.125 inch (9 points) on all sides
 */
export function getPageDimensionsWithBleed(
    pageSize: PageSize,
    customWidth?: number,
    customHeight?: number,
    withBleed: boolean = false,
    marginPreset: MarginPreset = 'kdp-default',
    customMargins?: CustomMargins
): PageDimensions {
    const bleedInches = withBleed ? 0.125 : 0;
    const margins = getMargins(marginPreset, customMargins);

    if (pageSize === 'custom' && customWidth && customHeight) {
        return {
            width: inchesToPoints(customWidth + (bleedInches * 2)),
            height: inchesToPoints(customHeight + (bleedInches * 2)),
            marginTop: inchesToPoints(margins.top + bleedInches),
            marginBottom: inchesToPoints(margins.bottom + bleedInches),
            marginInside: inchesToPoints(margins.inside + bleedInches),
            marginOutside: inchesToPoints(margins.outside + bleedInches)
        };
    }

    // For predefined page sizes, PAGE_SIZES already stores dimensions in points.
    // We need to add bleed (in points) to these dimensions.
    if (pageSize === 'custom') {
        // Fallback to 8.5x11 if custom but no dimensions provided
        const fallbackDimensions = PAGE_SIZES['8.5x11'];
        const bleedPoints = inchesToPoints(bleedInches);
        return {
            width: fallbackDimensions.width + (bleedPoints * 2),
            height: fallbackDimensions.height + (bleedPoints * 2),
            marginTop: inchesToPoints(margins.top + bleedInches),
            marginBottom: inchesToPoints(margins.bottom + bleedInches),
            marginInside: inchesToPoints(margins.inside + bleedInches),
            marginOutside: inchesToPoints(margins.outside + bleedInches)
        };
    }

    const baseDimensions = PAGE_SIZES[pageSize];
    const bleedPoints = inchesToPoints(bleedInches);

    return {
        width: baseDimensions.width + (bleedPoints * 2),
        height: baseDimensions.height + (bleedPoints * 2),
        // Margins are calculated based on the selected preset + bleed
        marginTop: inchesToPoints(margins.top + bleedInches),
        marginBottom: inchesToPoints(margins.bottom + bleedInches),
        marginInside: inchesToPoints(margins.inside + bleedInches),
        marginOutside: inchesToPoints(margins.outside + bleedInches)
    };
}

/**
 * Create a new jsPDF instance with the specified page size and optional bleed
 */
export function createPDF(pageSize: PageSize, customWidth?: number, customHeight?: number, withBleed: boolean = false): jsPDF {
    const dimensions = getPageDimensionsWithBleed(pageSize, customWidth, customHeight, withBleed);

    return new jsPDF({
        orientation: dimensions.width < dimensions.height ? 'portrait' : 'landscape',
        unit: 'pt',
        format: [dimensions.width, dimensions.height]
    });
}

/**
 * Add page numbers to the PDF (optional feature)
 */
export function addPageNumbers(pdf: jsPDF, pageSize: PageSize, customWidth?: number, customHeight?: number, withBleed: boolean = false) {
    const dimensions = getPageDimensionsWithBleed(pageSize, customWidth, customHeight, withBleed);
    const pageCount = pdf.getNumberOfPages();

    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);

    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        const pageNum = `${i}`;
        pdf.text(pageNum, dimensions.width / 2, dimensions.height - 20, {
            align: 'center'
        });
    }
}

/**
 * Download the PDF file
 */
export function downloadPDF(pdf: jsPDF, filename: string) {
    pdf.save(filename);
}
