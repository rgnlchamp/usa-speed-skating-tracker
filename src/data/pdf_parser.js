const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

/**
 * Parse a single PDF file to extract race results
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} Race data with metadata and results
 */
async function parsePDF(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);

        pdfParser.on('pdfParser_dataError', errData => {
            reject(new Error(`PDF parsing failed: ${errData.parserError}`));
        });

        pdfParser.on('pdfParser_dataReady', pdfData => {
            try {
                // Extract all text from all pages
                let allText = [];
                pdfData.Pages.forEach(page => {
                    if (page.Texts) {
                        page.Texts.forEach(text => {
                            try {
                                const decoded = decodeURIComponent(text.R[0].T);
                                allText.push(decoded);
                            } catch (e) {
                                // Fallback for malformed URIs
                                allText.push(text.R[0].T);
                            }
                        });
                    }
                });

                const fullText = allText.join(' ');
                const raceData = parseRaceText(fullText, pdfPath);
                resolve(raceData);
            } catch (error) {
                reject(error);
            }
        });

        pdfParser.loadPDF(pdfPath);
    });
}

/**
 * Extract race metadata and results from PDF text
 */
function parseRaceText(text, filename) {
    // Strict filename matching to avoid misidentification
    // Expected format: 14_Result_Men_5000_Division_A_2025...
    const filenameMatch = path.basename(filename).match(/(\d+)_result_(men|women)_?([a-z0-9]+)_([ab])_?/i);

    let gender = 'unknown';
    let distance = 'unknown';
    let division = 'unknown';

    if (filenameMatch) {
        gender = filenameMatch[2].toLowerCase();
        let rawDistance = filenameMatch[3].toLowerCase();
        division = filenameMatch[4].toUpperCase();

        if (rawDistance === 'massstart') distance = 'Mass Start';
        else if (rawDistance === 'teampursuit') distance = 'Team Pursuit';
        else if (rawDistance === 'teamprint') distance = 'Team Sprint';
        else if (rawDistance.match(/^\d+$/)) distance = rawDistance + 'm';
        else if (!rawDistance.endsWith('m') && rawDistance.match(/^\d+/)) distance = rawDistance; // Already has m or is just number

        // Normalize distance
        if (distance.match(/^\d+$/)) distance += 'm';
    }

    // Try multiple patterns for event number
    let eventMatch = text.match(/ISU SPEED SKATING WORLD CUP #(\d+)\s+([^\/]+)/i);
    if (!eventMatch) {
        eventMatch = text.match(/WORLD CUP.*?#(\d+)/i);
    }
    if (!eventMatch) {
        // Fallback: Extract from filename if it starts with digit
        const filenameEventMatch = path.basename(filename).match(/^(\d+)_result/i);
        if (filenameEventMatch) {
            const filenameNum = parseInt(filenameEventMatch[1]);
            // Map filename numbers to event numbers
            // Filenames 1-9 = WC1 (Calgary), 10-28 = WC2 (Salt Lake City)
            if (filenameNum >= 1 && filenameNum <= 9) {
                eventMatch = ['', '1', 'Calgary'];
            } else if (filenameNum >= 10 && filenameNum <= 28) {
                eventMatch = ['', '2', 'Salt Lake City'];
            }
        }
    }
    const eventNumber = eventMatch ? eventMatch[1] : '1';
    const eventLocation = eventMatch ? eventMatch[2]?.trim() : 'Unknown';

    const dateMatch = text.match(/(\d{1,2})\s*-\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
    const eventDate = dateMatch ? `${dateMatch[3]} ${dateMatch[4]}` : 'Unknown';

    const results = parseResultsTable(text, distance, filename);

    return {
        eventNumber,
        eventLocation,
        eventDate,
        distance,
        gender,
        division,
        name: `${distance} ${gender.charAt(0).toUpperCase() + gender.slice(1)} Division ${division}`,
        results
    };
}

/**
 * Parse results table - improved version with Mass Start support
 */
function parseResultsTable(text, distance, filename) {
    const results = [];
    const tokens = text.split(/\s+/);
    let i = 0;
    const seenRanks = new Set();

    while (i < tokens.length - 5) {
        const rankCandidate = parseInt(tokens[i]);
        const isDebug = rankCandidate === 10;

        if (isDebug) {
            console.log(`[DEBUG] Processing Rank 10 at index ${i}. Tokens: ${tokens.slice(i, i + 10).join(' ')}`);
        }

        if (isNaN(rankCandidate) || rankCandidate < 1 || rankCandidate > 99) {
            i++;
            continue;
        }

        if (seenRanks.has(rankCandidate)) {
            if (isDebug) console.log(`[DEBUG] Rank 10 already seen.`);
            i++;
            continue;
        }

        // Pattern: rank bibNum name(s) COUNTRY ...
        let j = i + 2; // Skip bib
        const nameParts = [];
        let country = null;
        let countryIndex = -1;

        // Scan for Country Code
        while (j < tokens.length && nameParts.length < 15) {
            const token = tokens[j];

            if (isCountryCode(token)) {
                country = token;
                countryIndex = j;
                break;
            }

            if (token.match(/^[A-ZÀ-ÿ\-']+$/i)) {
                const lower = token.toLowerCase();
                if (lower !== 't' && lower !== 'q' && lower !== 'r') {
                    nameParts.push(token);
                }
            }
            j++;
        }

        if (isDebug) console.log(`[DEBUG] Country: ${country}, NameParts: ${nameParts.join(' ')}`);

        if (!country || nameParts.length === 0) {
            if (isDebug) console.log(`[DEBUG] Failed to find country or name.`);
            i++;
            continue;
        }

        // Found Name and Country. Now look for Time/Points.
        let time = null;
        let timeIndex = -1;

        // Mass Start Handling
        if (distance === 'Mass Start') {
            for (let k = countryIndex + 1; k < Math.min(countryIndex + 8, tokens.length); k++) {
                if (tokens[k].match(/^\d{1,2}:\d{2}\.\d{2}$/)) {
                    time = tokens[k];
                    timeIndex = k;
                    break;
                }
            }
            if (!time) time = 'Mass Start';
        } else {
            // Standard Events
            for (let k = countryIndex + 1; k < Math.min(countryIndex + 5, tokens.length); k++) {
                if (tokens[k].match(/^\d{1,2}:\d{2}\.\d{2}$/) || tokens[k].match(/^\d{2}\.\d{2}(\(\d+\))?$/)) {
                    time = tokens[k].replace(/\(\d+\)/g, '');
                    timeIndex = k;
                    break;
                }
            }
        }

        if (isDebug) console.log(`[DEBUG] Time: ${time}`);

        if (!time && distance !== 'Mass Start') {
            if (isDebug) console.log(`[DEBUG] Failed to find time.`);
            i++;
            continue;
        }

        // Look for Points
        let points = 0;
        let searchStartIndex = timeIndex !== -1 ? timeIndex : countryIndex;
        let pointsIndex = searchStartIndex;

        for (let k = searchStartIndex + 1; k < Math.min(searchStartIndex + 10, tokens.length); k++) {
            if (tokens[k].startsWith('+')) continue;
            if (tokens[k] === 'In' || tokens[k] === 'Out' || tokens[k] === 'Ou' || tokens[k] === 't') continue;

            const pointsCandidate = parseInt(tokens[k]);
            if (!isNaN(pointsCandidate) && pointsCandidate >= 0 && pointsCandidate <= 100) {
                points = pointsCandidate;
                pointsIndex = k;
                break;
            }
        }

        if (isDebug) console.log(`[DEBUG] Points: ${points}`);

        const rank = rankCandidate.toString();
        let name = nameParts.join(' ').trim();

        // Clean up common garbage text
        name = name.replace(/Official ISU results Page of/gi, '')
            .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
            .replace(/Page of/gi, '')
            .replace(/Created on/gi, '')
            .trim();

        name = cleanName(name);

        if (name.match(/^(Rnk|Nr|Name|Country|Laps|Total|Time|Points)/i)) {
            i++;
            continue;
        }

        if (name.length >= 3) {
            if (isDebug) console.log(`[DEBUG] Pushing result: ${name} (${country})`);
            results.push({ rank, name, country, time, points });
            seenRanks.add(rankCandidate);
            i = pointsIndex + 1;
            continue;
        }

        if (isDebug) console.log(`[DEBUG] Name too short or invalid: ${name}`);

        i++;
    }

    return results;
}

const VALID_COUNTRY_CODES = new Set([
    'NED', 'USA', 'CAN', 'JPN', 'KOR', 'CHN', 'NOR', 'GER', 'POL', 'ITA',
    'KAZ', 'BEL', 'EST', 'AUT', 'CZE', 'ESP', 'GBR', 'HUN', 'SUI', 'SWE',
    'DEN', 'FIN', 'FRA', 'ROU', 'TPE', 'NZL', 'ARG', 'COL', 'AUS', 'LAT',
    'UKR', 'BLR', 'RUS', 'ISR', 'MGL', 'POR', 'BRA', 'CHI', 'IND', 'IRL',
    'KGZ', 'LTU', 'LUX', 'MAR', 'MEX', 'PHI', 'PRK', 'RSA', 'SVK', 'THA',
    'AIN', 'UZB', 'GRE', 'LAT', 'POR'
]);

function isCountryCode(str) {
    return str && VALID_COUNTRY_CODES.has(str);
}

async function parseAllPDFs(dirPath) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.pdf'));
    const results = [];

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
            const raceData = await parsePDF(filePath);
            results.push(raceData);
            console.log(`✓ Parsed: ${file} → ${raceData.name} (${raceData.results.length} results)`);
        } catch (error) {
            console.error(`✗ Failed to parse ${file}:`, error.message);
        }
    }

    return results;
}

if (require.main === module) {
    (async () => {
        console.log('=== PDF Parser Test ===\n');
        const pdfDir = path.join(__dirname, '../../data/pdf');
        const races = await parseAllPDFs(pdfDir);
    })();
}

module.exports = { parsePDF, parseAllPDFs, parseRaceText };

function cleanName(name) {
    if (!name) return '';
    return name
        .replace(/\s+-\s+/g, '-') // Fix "Wei - Lin" -> "Wei-Lin"
        .replace(/-\s+/g, '-')    // Fix "Wei- Lin" -> "Wei-Lin"
        .replace(/\s+-/g, '-')    // Fix "Wei -Lin" -> "Wei-Lin"
        // Fix spaced out diacritics (uppercase)
        .replace(/([A-Z])\s+([ØÖÜÄÉÈÀÓÅ])\s+([A-Z])/g, '$1$2$3')
        .replace(/([A-Z])\s+([ØÖÜÄÉÈÀÓÅ])(?=\s|$)/g, '$1$2')
        .replace(/(^|\s)([ØÖÜÄÉÈÀÓÅ])\s+([A-Z])/g, '$1$2$3')
        // Fix spaced out diacritics (lowercase) - be careful not to merge separate words
        .replace(/([a-z])\s+([øöüäéèàóå])\s+([a-z])/g, '$1$2$3')
        // Specific fix for "Bj ø rn" -> "Bjørn"
        .replace(/Bj\s+ø\s+rn/g, 'Bjørn')
        // Specific fix for "Metod j" -> "Metoděj" (PDF often drops the ě)
        .replace(/Metod\s+j/g, 'Metoděj')
        // Specific fix for "And elika" -> "Andżelika"
        .replace(/And\s+elika/g, 'Andżelika')
        // Specific fix for "W Ó JCIK" -> "WÓJCIK"
        .replace(/W\s+Ó\s+JCIK/g, 'WÓJCIK')
        .trim();
}
