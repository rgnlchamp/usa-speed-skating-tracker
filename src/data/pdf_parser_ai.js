/**
 * AI-Powered PDF Parser using Google Gemini
 * 
 * Uses Gemini's vision capabilities to accurately extract race results from PDF files.
 * Caches results to avoid repeated API calls.
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Cache directory for parsed results
const CACHE_DIR = path.join(__dirname, '../../data/ai_cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Get cache path for a PDF file
 */
function getCachePath(pdfPath) {
    const filename = path.basename(pdfPath, '.pdf');
    return path.join(CACHE_DIR, `${filename}.json`);
}

/**
 * Check if cached result exists and is valid
 */
function getCachedResult(pdfPath) {
    const cachePath = getCachePath(pdfPath);
    if (fs.existsSync(cachePath)) {
        try {
            const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            // Check if PDF hasn't been modified since cache was created
            const pdfStats = fs.statSync(pdfPath);
            if (cached.pdfMtime && new Date(cached.pdfMtime).getTime() === pdfStats.mtime.getTime()) {
                return cached.data;
            }
        } catch (e) {
            console.warn(`Cache read error for ${pdfPath}:`, e.message);
        }
    }
    return null;
}

/**
 * Save result to cache
 */
function saveToCacheResult(pdfPath, data) {
    const cachePath = getCachePath(pdfPath);
    const pdfStats = fs.statSync(pdfPath);
    const cacheData = {
        pdfMtime: pdfStats.mtime.toISOString(),
        cachedAt: new Date().toISOString(),
        data
    };
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

/**
 * Parse PDF using Gemini AI
 */
async function parsePDFWithAI(pdfPath, apiKey) {
    // Check cache first
    const cached = getCachedResult(pdfPath);
    if (cached) {
        console.log(`  [CACHE HIT] ${path.basename(pdfPath)}`);
        return cached;
    }

    console.log(`  [AI PARSING] ${path.basename(pdfPath)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Read PDF as base64
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');

    // Extract metadata from filename
    const filename = path.basename(pdfPath);
    const filenameMatch = filename.match(/(\d+)_result_(men|women)_?([a-z0-9]+)_([ab])_?/i);

    let expectedGender = filenameMatch ? filenameMatch[2] : 'unknown';
    let expectedDistance = filenameMatch ? filenameMatch[3] : 'unknown';
    let expectedDivision = filenameMatch ? filenameMatch[4].toUpperCase() : 'unknown';

    // Normalize distance
    if (expectedDistance.match(/^\d+$/)) expectedDistance += 'm';
    if (expectedDistance === 'massstart') expectedDistance = 'Mass Start';
    if (expectedDistance === 'teampursuit') expectedDistance = 'Team Pursuit';

    const prompt = `You are parsing an ISU Speed Skating World Cup race results PDF.

Extract ALL race results and return them as JSON. Be very careful with:
1. Skater names - preserve exact spelling including accents (é, ø, ü, etc.)
2. Country codes - use standard 3-letter IOC codes (USA, NED, JPN, KOR, etc.)
3. Times - format as M:SS.SS or SS.SS (e.g., "1:12.34" or "34.56")
4. Points - integer values
5. DNF/DSQ entries - include them with time as "DNF" or "DSQ" and their points if shown
6. Tied ranks - multiple skaters can have the same rank

Expected event: ${expectedDistance} ${expectedGender} Division ${expectedDivision}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
    "eventNumber": "1",
    "eventLocation": "Salt Lake City (USA)",
    "eventDate": "Nov 2025",
    "distance": "${expectedDistance}",
    "gender": "${expectedGender}",
    "division": "${expectedDivision}",
    "results": [
        {
            "rank": "1",
            "name": "Skater Name",
            "country": "NED",
            "time": "34.56",
            "points": 60
        }
    ]
}

IMPORTANT: Extract EVERY skater from the results table, not just the top few. Include all ranks shown in the PDF.`;

    try {
        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfBase64
                }
            }
        ]);

        const response = result.response.text();

        // Clean up response - remove markdown code blocks if present
        let jsonStr = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        // Parse JSON
        const parsed = JSON.parse(jsonStr);

        // Validate structure
        if (!parsed.results || !Array.isArray(parsed.results)) {
            throw new Error('Invalid response structure - missing results array');
        }

        // Add name field for consistency
        parsed.name = `${parsed.distance} ${parsed.gender.charAt(0).toUpperCase() + parsed.gender.slice(1)} Division ${parsed.division}`;

        // Save to cache
        saveToCacheResult(pdfPath, parsed);

        console.log(`    ✓ Extracted ${parsed.results.length} results`);
        return parsed;

    } catch (error) {
        console.error(`    ✗ AI parsing failed for ${filename}:`, error.message);

        // Fall back to standard parser
        const { parsePDF } = require('./pdf_parser');
        console.log(`    → Falling back to standard parser`);
        return await parsePDF(pdfPath);
    }
}

/**
 * Parse all PDFs in a directory using AI
 */
async function parseAllPDFsWithAI(dirPath, apiKey) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.pdf'));
    const results = [];

    console.log(`\n📄 Parsing ${files.length} PDFs with Gemini AI...\n`);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
            const raceData = await parsePDFWithAI(filePath, apiKey);
            results.push(raceData);
        } catch (error) {
            console.error(`✗ Failed to parse ${file}:`, error.message);
        }
    }

    console.log(`\n✅ Successfully parsed ${results.length}/${files.length} PDFs\n`);
    return results;
}

/**
 * Clear the AI cache
 */
function clearCache() {
    if (fs.existsSync(CACHE_DIR)) {
        const files = fs.readdirSync(CACHE_DIR);
        files.forEach(file => {
            fs.unlinkSync(path.join(CACHE_DIR, file));
        });
        console.log(`Cleared ${files.length} cached results`);
    }
}

// Test if run directly
if (require.main === module) {
    (async () => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Please set GEMINI_API_KEY environment variable');
            process.exit(1);
        }

        const pdfDir = path.join(__dirname, '../../data/pdf');

        // Test with first PDF
        const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
        if (files.length > 0) {
            const testPdf = path.join(pdfDir, files[0]);
            console.log(`Testing with: ${files[0]}`);
            const result = await parsePDFWithAI(testPdf, apiKey);
            console.log(JSON.stringify(result, null, 2));
        }
    })();
}

module.exports = { parsePDFWithAI, parseAllPDFsWithAI, clearCache };
