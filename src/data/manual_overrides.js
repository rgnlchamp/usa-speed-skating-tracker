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
        // Fix for Erin Jackson: DNF in Women's 500m (A Division) - WC3
        // Rule: DNF in A Division gets last place points (21 points)
        name: "Erin Jackson",
        country: "USA",
        distance: "500m",
        gender: "women",
        division: "A",  // Specify division to match correct race
        eventId: "WC3", // World Cup #3
        points: 21,
        rank: "20", // Last place in A Division
        time: "DNF"
    }
];
