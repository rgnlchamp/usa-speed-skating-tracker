/**
 * Manual Overrides for Race Results
 * 
 * This file contains manual corrections for race results that are either:
 * 1. Missing from the PDF files (e.g. parsing errors)
 * 2. Incorrect in the PDF files
 * 3. Need adjustment for other reasons
 * 
 * These overrides are applied during the data aggregation phase in store_pdf.js.
 * 
 * NOTE: DNF entries are now automatically parsed from PDFs with their points.
 */

module.exports = [
    // No manual overrides needed - DNF parsing is now automatic
];

