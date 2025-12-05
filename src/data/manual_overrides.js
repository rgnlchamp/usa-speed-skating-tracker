/**
 * Manual Overrides for Race Results
 * 
 * This file contains manual corrections for race results that are either:
 * 1. Missing from the PDF files (e.g. parsing errors)
 * 2. Incorrect in the PDF files
 * 3. Need adjustment for other reasons
 * 
 * These overrides are applied during the data aggregation phase in store_pdf.js.
 */

module.exports = [
    {
        // Fix for Erin Jackson missing from Women's 1000m results on 2025-12-05
        name: "Erin Jackson",
        country: "USA",
        distance: "1000m",
        gender: "women",
        eventId: "WC3", // World Cup #3
        points: 21,
        rank: "20", // Approximate rank for 21 points
        time: "1:15.00" // Placeholder time, update if known
    }
];
