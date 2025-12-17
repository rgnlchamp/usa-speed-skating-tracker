/**
 * Manual Overrides for Race Results
 * 
 * This file contains manual corrections for race results that are either:
 * 1. Missing from the PDF files (e.g. parsing errors for DNF entries)
 * 2. Incorrect in the PDF files
 * 3. Need adjustment for other reasons
 * 
 * These overrides are applied during the data aggregation phase in store_pdf.js.
 */

module.exports = [
    {
        // Erin Jackson: DNF in Women's 1000m (A Division) - WC3
        // Parser misses this because 'Jackson' is missing from the PDF text layer
        name: "Erin Jackson",
        country: "USA",
        distance: "1000m",
        gender: "women",
        division: "A",
        eventId: "WC3",
        points: 21,
        rank: "20",
        time: "DNF"
    }
];
