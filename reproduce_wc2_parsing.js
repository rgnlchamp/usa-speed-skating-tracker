const VALID_COUNTRY_CODES = new Set([
    'NED', 'USA', 'CAN', 'JPN', 'KOR', 'CHN', 'NOR', 'GER', 'POL', 'ITA',
    'KAZ', 'BEL', 'EST', 'AUT', 'CZE', 'ESP', 'GBR', 'HUN', 'SUI', 'SWE',
    'DEN', 'FIN', 'FRA', 'ROU', 'TPE', 'NZL', 'ARG', 'COL', 'AUS', 'LAT',
    'UKR', 'BLR', 'RUS', 'ISR', 'MGL', 'POR', 'BRA', 'CHI', 'IND', 'IRL',
    'KGZ', 'LTU', 'LUX', 'MAR', 'MEX', 'PHI', 'PRK', 'RSA', 'SVK', 'THA',
    'AIN', 'UZB', 'GRE'
]);

function isCountryCode(str) {
    return str && VALID_COUNTRY_CODES.has(str);
}

function parseLine(line) {
    const tokens = line.split(/\s+/);
    console.log('Tokens:', tokens);

    let i = 0;
    while (i < tokens.length - 5) { // Reduced safety margin for test
        const rankCandidate = parseInt(tokens[i]);
        if (isNaN(rankCandidate)) { i++; continue; }

        let j = i + 2;
        let country = null;
        let countryIndex = -1;

        while (j < tokens.length && j < i + 15) {
            if (isCountryCode(tokens[j])) {
                country = tokens[j];
                countryIndex = j;
                break;
            }
            j++;
        }

        if (!country) { i++; continue; }
        console.log(`Found Country: ${country} at index ${countryIndex}`);

        let time = null;
        let timeIndex = -1;

        for (let k = countryIndex + 1; k < Math.min(countryIndex + 5, tokens.length); k++) {
            if (tokens[k].match(/^\d{1,2}:\d{2}\.\d{2}$/) || tokens[k].match(/^\d{2}\.\d{2}(\(\d+\))?$/)) {
                time = tokens[k].replace(/\(\d+\)/g, '');
                timeIndex = k;
                break;
            }
        }
        console.log(`Found Time: ${time} at index ${timeIndex}`);

        if (!time) { i++; continue; }

        let points = 0;
        let searchStartIndex = timeIndex;

        for (let k = searchStartIndex + 1; k < Math.min(searchStartIndex + 10, tokens.length); k++) {
            if (tokens[k].startsWith('+')) continue;
            if (tokens[k] === 'In' || tokens[k] === 'Out') continue;

            const pointsCandidate = parseInt(tokens[k]);
            if (!isNaN(pointsCandidate) && pointsCandidate >= 0 && pointsCandidate <= 100) {
                points = pointsCandidate;
                break;
            }
        }
        console.log(`Found Points: ${points}`);
        return { rank: rankCandidate, country, time, points };
    }
}

const line = "10        25     Yankun ZHAO                                            CAN        16     Out                        1:08.22         +1.09                11";
parseLine(line);
