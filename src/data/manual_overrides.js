/**
 * Manual Overrides for Race Results
 * 
 * This file contains manual corrections for race results that are either:
 * 1. Missing from the PDF files (e.g. parsing errors for DNF entries)
 * 2. Incorrect in the PDF files
 * 3. Need adjustment for other reasons
 * 
 * These overrides are applied during the data aggregation phase in store_pdf.js.
 * 
 * NOTE: AI parsing is rate-limited, so the standard parser is being used.
 * These are known DNF entries that the standard parser misses.
 * Remove these once AI parsing is working reliably.
 */

module.exports = [
    {
        // Erin Jackson: DNF in Women's 500m (A Division) - WC3
        // Rule: DNF in A Division gets last place points (21 points)
        name: "Erin Jackson",
        country: "USA",
        distance: "500m",
        gender: "women",
        division: "A",
        eventId: "WC3",
        points: 21,
        rank: "20",
        time: "DNF"
    },
    {
        // Erin Jackson: DNF in Women's 1000m (A Division) - WC3
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
