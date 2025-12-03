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
            console.error(`[PDF Error] Failed to parse ${pdfPath}:`, errData.parserError);
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
 * Parse Team Pursuit results - uses full country names instead of codes
 */


/**
 * Parse Team Pursuit results - uses full country names instead of codes
 */
function parseTeamPursuitResults(text) {
    const results = [];
    const tokens = text.split(/\s+/);
    const seenRanks = new Set();

    // Words to skip (common noise in Team Pursuit PDFs)
    const skipWords = new Set(['of', 'the', 'Finish', 'Crossing', 'Start', 'Lap', 'Official', 'ISU', 'results', 'Page', 'F']);

    for (let i = 0; i < tokens.length - 10; i++) {
        const rankCandidate = parseInt(tokens[i]);

        // Look for rank numbers 1-20
        if (isNaN(rankCandidate) || rankCandidate < 1 || rankCandidate > 20) {
            continue;
        }

        if (seenRanks.has(rankCandidate)) {
            continue;
        }

        // After rank, look for country name (multiple words until we hit a time pattern)
        let j = i + 1;
        const countryWords = [];
        let time = null;
        let timeIndex = -1;

        // Collect words until we find a time pattern (e.g., "3:01.09" or "2:58.41")
        while (j < tokens.length && countryWords.length < 10) {
            const token = tokens[j];

            // Check if this looks like a time (format: M:SS.SS or MM:SS.SS)
            if (token.match(/^\d{1,2}:\d{2}\.\d{2}$/)) {
                time = token;
                timeIndex = j;
                break;
            }

            // Add to country name if it looks like a word and isn't in skip list
            if (token.match(/^[A-Za-z]+$/) && !skipWords.has(token)) {
                // Capitalize first letter for proper country name matching
                const capitalized = token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
                countryWords.push(capitalized);
            }

            j++;
        }

        if (!time || countryWords.length === 0) {
            continue;
        }

        // Combine country words
        const countryName = countryWords.join(' ');

        // Map to country code
        const country = COUNTRY_NAME_TO_CODE[countryName] || countryName;

        // Look for points after time (should be within next few tokens)
        let points = 0;
        for (let k = timeIndex + 1; k < Math.min(timeIndex + 8, tokens.length); k++) {
            if (tokens[k].startsWith('+')) continue; // Skip time gaps

            const pointsCandidate = parseInt(tokens[k]);
            if (!isNaN(pointsCandidate) && pointsCandidate >= 0 && pointsCandidate <= 150) {
                points = pointsCandidate;
                break;
            }
        }

        // Correct rank based on points if possible (handles merged text like "11" for Rank 1)
        let finalRank = rankCandidate.toString();
        if (points === 60) finalRank = '1';
        else if (points === 54) finalRank = '2';
        else if (points === 48) finalRank = '3';
        else if (points === 43) finalRank = '4';
        else if (points === 40) finalRank = '5';
        else if (points === 38) finalRank = '6';
        else if (points === 36) finalRank = '7';
        else if (points === 34) finalRank = '8';
        else if (points === 32) finalRank = '9';
        else if (points === 31) finalRank = '10';

        results.push({
            rank: finalRank,
            name: country,  // For Team Pursuit, name is the country
            country: country,
            time: time,
            points: points
        });

        seenRanks.add(rankCandidate);
        // Also add the corrected rank to seenRanks to avoid duplicates if we encounter it again
        if (finalRank !== rankCandidate.toString()) {
            seenRanks.add(parseInt(finalRank));
        }

        i = timeIndex;  // Skip ahead to avoid re-processing
    }

    return results;
}

/**
 * Parse results table - improved version with Mass Start support
 */
function parseResultsTable(text, distance, filename) {
    // Special handling for Team Pursuit - uses full country names, not 3-letter codes
    if (distance === 'Team Pursuit') {
        return parseTeamPursuitResults(text);
    }

    const results = [];
    const tokens = text.split(/\s+/);
    let i = 0;
    const seenRanks = new Set();

    while (i < tokens.length - 5) {
        const rankCandidate = parseInt(tokens[i]);
        const isDebug = false;

        if (isDebug) {
            console.log(`[DEBUG] Processing Rank ${rankCandidate} at index ${i}. Tokens: ${tokens.slice(i, i + 10).join(' ')}`);
        }

        if (isNaN(rankCandidate) || rankCandidate < 1 || rankCandidate > 99) {
            i++;
            continue;
        }

        // Strict check: Token must be exactly the number (e.g. "15", not "15-11-2025")
        if (tokens[i] !== rankCandidate.toString()) {
            if (isDebug) console.log(`[DEBUG] Rank ${rankCandidate} rejected: Token '${tokens[i]}' is not exact match.`);
            i++;
            continue;
        }

        // Ignore "Page X of Y" where Y is interpreted as a rank
        if (i > 0 && tokens[i - 1].toLowerCase() === 'of') {
            if (isDebug) console.log(`[DEBUG] Rank ${rankCandidate} rejected: Preceded by 'of'.`);
            i++;
            continue;
        }

        // REMOVED seenRanks check to allow for tied ranks (e.g. two skaters at Rank 12)
        // The strict Bib number check below is sufficient to prevent false positives.
        /*
        if (seenRanks.has(rankCandidate)) {
            if (isDebug) console.log(`[DEBUG] Rank ${rankCandidate} already seen.`);
            i++;
            continue;
        }
        */

        // Verify that the next token is a Bib Number (must be an integer)
        // This prevents false positives like "15" from "15-11-2025" in the header
        const bibCandidate = parseInt(tokens[i + 1]);
        if (isNaN(bibCandidate)) {
            if (isDebug) console.log(`[DEBUG] Rank ${rankCandidate} rejected: Next token '${tokens[i + 1]}' is not a valid Bib number.`);
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
                // Match M:SS.SS((N)) or SS.SS((N))
                if (tokens[k].match(/^\d{1,2}:\d{2}\.\d{2}(\(\d+\))?$/) || tokens[k].match(/^\d{2}\.\d{2}(\(\d+\))?$/)) {
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

// Country name to code mapping for Team Pursuit (uses full country names)
const COUNTRY_NAME_TO_CODE = {
    'United States Of America': 'USA',
    'United States': 'USA',
    'Usa': 'USA',
    'Netherlands': 'NED',
    'Canada': 'CAN',
    'Japan': 'JPN',
    'Republic Of Korea': 'KOR',
    'Korea': 'KOR',
    "People's Republic Of China": 'CHN',
    'China': 'CHN',
    'Norway': 'NOR',
    'Germany': 'GER',
    'Poland': 'POL',
    'Italy': 'ITA',
    'Kazakhstan': 'KAZ',
    'Belgium': 'BEL',
    'Estonia': 'EST',
    'Austria': 'AUT',
    'Czechia': 'CZE',
    'Czech Republic': 'CZE',
    'Spain': 'ESP',
    'Great Britain': 'GBR',
    'Hungary': 'HUN',
    'Switzerland': 'SUI',
    'Sweden': 'SWE',
    'Denmark': 'DEN',
    'Finland': 'FIN',
    'France': 'FRA',
    'Romania': 'ROU',
    'Chinese Taipei': 'TPE',
    'New Zealand': 'NZL',
    'Argentina': 'ARG',
    'Colombia': 'COL',
    'Australia': 'AUS',
    'Latvia': 'LAT',
    'Ukraine': 'UKR',
    'Belarus': 'BLR',
    'Russia': 'RUS',
    'Israel': 'ISR',
    'Mongolia': 'MGL',
    'Portugal': 'POR',
    'Brazil': 'BRA',
    'Chile': 'CHI',
    'India': 'IND',
    'Ireland': 'IRL'
};



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
    const cleaned = name
        .replace(/\s+-\s+/g, '-') // Fix "Wei - Lin" -> "Wei-Lin"
        .replace(/-\s+/g, '-')    // Fix "Wei- Lin" -> "Wei-Lin"
        .replace(/\s+-/g, '-')    // Fix "Wei -Lin" -> "Wei-Lin"
        // Fix spaced out diacritics (uppercase) - Added Í
        .replace(/([A-Z])\s+([ØÖÜÄÉÈÀÓÅÍ])\s+([A-Z])/g, '$1$2$3')
        .replace(/([A-Z])\s+([ØÖÜÄÉÈÀÓÅÍ])(?=\s|$)/g, '$1$2')
        .replace(/(^|\s)([ØÖÜÄÉÈÀÓÅÍ])\s+([A-Z])/g, '$1$2$3')
        // Fix spaced out diacritics (lowercase) - Added í
        .replace(/([a-z])\s+([øöüäéèàóåí])\s+([a-z])/g, '$1$2$3')
        // Specific fix for "Bj ø rn" -> "Bjørn"
        .replace(/Bj\s+ø\s+rn/g, 'Bjørn')
        // Specific fix for "Metod j" -> "Metoděj" (PDF often drops the ě)
        .replace(/Metod\s+j/g, 'Metoděj')
        .replace(/Metod\s*ě\s*j/g, 'Metoděj') // Fix spaced ě
        // Specific fix for "And elika" -> "Andżelika"
        .replace(/And\s+elika/g, 'Andżelika')
        // Specific fix for "W Ó JCIK" -> "WÓJCIK"
        .replace(/W\s+Ó\s+JCIK/g, 'WÓJCIK')
        // Fixes for Men 500m discrepancies
        .replace(/Sebas\s+Diniz/gi, 'Sebastian Diniz')
        .replace(/Damian\s+Urek/gi, 'Damian Żurek')
        .replace(/Damian\s+Zurek/gi, 'Damian Żurek') // Normalize to Żurek
        .replace(/Yuta\s+Hirose/gi, 'Yuuta Hirose')   // Match Official
        .replace(/Altay\s+Zhardembekuly/gi, 'Altaj Zhardembekuly') // Match Official
        .replace(/Gabriel\s+Gro\s+SS/gi, 'Gabriel Groß') // Fix German Eszett
        .replace(/David\s+La\s+Rue/gi, 'David Larue')   // Fix spacing
        .replace(/Antoine\s+G\s*[ée]\s*linas\s*-\s*Beaulieu/gi, 'Antoine Gélinas-Beaulieu') // Fix hyphen and spaces
        .replace(/Antoine\s+G\s*[ée]\s*linas\s*-\s*Beaulieu/gi, 'Antoine Gélinas-Beaulieu') // Fix hyphen and spaces
        .replace(/Antoine\s+G\s*[ée]\s*linas\s+Beaulieu/gi, 'Antoine Gélinas-Beaulieu') // Fallback
        .replace(/G[ée]linas\s+Beaulieu/gi, 'Gélinas-Beaulieu') // Fallback
        .replace(/Brooklyn\s+Mcdougall/gi, 'Brooklyn McDougall') // Fix McDougall case
        .replace(/Metoděj\s+J\s*Í\s*Lek/gi, 'Metoděj Jílek') // Fix Jílek specific
        .replace(/Metoděj\s+J\s*Í\s*LEK/gi, 'Metoděj Jílek') // Fix Jílek specific caps
        .replace(/^Jílek$/i, 'Metoděj Jílek') // Fallback for Jílek alone
        .trim();

    // Convert to Title Case (e.g. "NAME SURNAME" -> "Name Surname")
    // But keep country codes (3 letters) in caps if they appear
    return cleaned.split(/[\s-]+/)
        .filter(part => part.length > 0)
        .map(part => {
            // Skip country codes if they happen to be in the name string
            if (VALID_COUNTRY_CODES.has(part)) return part;

            // Handle names with apostrophes like "D'Alessandro"
            if (part.includes("'")) {
                return part.split("'").map(p =>
                    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                ).join("'");
            }

            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }).join(' ');
}
