// Qualification Rules for Milan 2026 Speed Skating

const EVENT_QUOTAS = {
    '500m': 28,
    '1000m': 28,
    '1500m': 28,
    '3000m': 20, // Women
    '5000m': 20, // Men 5000 / Women 5000
    '10000m': 12, // Men
    'Mass Start': 24
};

const MAX_QUOTA_PER_NOC = 3; // Per event

/**
 * Calculates the SOQC Points Ranking.
 * Aggregates points from all World Cup results for a specific distance.
 * @param {Array} allResults - List of result objects { skater: {name, country}, points, time, eventId }
 * @returns {Array} Sorted list of skaters with total points.
 */
function calculateSOQCPoints(allResults) {
    const skaterPoints = {};

    allResults.forEach(result => {
        const key = `${result.skater.name}|${result.skater.country}`;
        if (!skaterPoints[key]) {
            skaterPoints[key] = {
                name: result.skater.name,
                country: result.skater.country,
                totalPoints: 0,
                bestTime: '99:99.99', // Placeholder
                results: []
            };
        }

        // Parse points (handle strings, empty, etc.)
        const points = parseInt(result.points, 10) || 0;
        skaterPoints[key].totalPoints += points;
        skaterPoints[key].results.push(result);

        // Update best time if available and better
        if (result.time && compareTimes(result.time, skaterPoints[key].bestTime) < 0) {
            skaterPoints[key].bestTime = result.time;
        }
    });

    return Object.values(skaterPoints).sort((a, b) => {
        // Sort by Points Descending
        if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
        }
        // Tie-breaker: Best Time (SOQC Times) - Simplified
        return compareTimes(a.bestTime, b.bestTime);
    });
}

/**
 * Calculates the SOQC Times Ranking.
 * Ranks skaters by their best time achieved in the World Cups.
 * @param {Array} allResults 
 * @returns {Array} Sorted list of skaters by best time.
 */
function calculateSOQCTimes(allResults) {
    const skaterTimes = {};

    allResults.forEach(result => {
        const key = `${result.skater.name}|${result.skater.country}`;
        if (!skaterTimes[key]) {
            skaterTimes[key] = {
                name: result.skater.name,
                country: result.skater.country,
                bestTime: '99:99.99'
            };
        }

        if (result.time && compareTimes(result.time, skaterTimes[key].bestTime) < 0) {
            skaterTimes[key].bestTime = result.time;
        }
    });

    return Object.values(skaterTimes)
        .filter(s => s.bestTime !== '99:99.99')
        .sort((a, b) => compareTimes(a.bestTime, b.bestTime));
}

/**
 * Allocates quotas based on SOQC rankings.
 * @param {string} distance - e.g., '500m'
 * @param {Array} soqcPoints - Ranked list by points
 * @param {Array} soqcTimes - Ranked list by times
 * @returns {Object} { qualified: [], reserve: [], nocCounts: {} }
 */
function allocateQuotas(distance, soqcPoints, soqcTimes) {
    const maxQuota = EVENT_QUOTAS[distance] || 28;
    const qualified = [];
    const nocCounts = {};
    const qualifiedSkaters = new Set();

    // Helper to add skater if NOC quota allows
    function tryQualify(skater, method) {
        const key = `${skater.name}|${skater.country}`;
        if (qualifiedSkaters.has(key)) return false; // Already qualified

        const country = skater.country;
        const currentCount = nocCounts[country] || 0;

        if (currentCount < MAX_QUOTA_PER_NOC) {
            qualified.push({ ...skater, method });
            qualifiedSkaters.add(key);
            nocCounts[country] = currentCount + 1;
            return true;
        }
        return false;
    }

    // Allocation logic (Simplified interpretation of D.1.2)
    // Usually a mix of Points and Times. 
    // For now, let's assume top X from Points, then fill remainder with Times?
    // The rules say "combine two sets of rankings".
    // Usually it's something like Top 20 from Points, then remaining 8 from Times.
    // Let's assume a 70/30 split or similar if not explicitly defined in the snippet provided.
    // The snippet says: "highest ranked SOQC positions will consist of a certain number... from SOQCP and SOQCT".
    // It doesn't specify the exact split in the text provided, but usually it's majority Points.
    // I'll assume filling from Points first until full, as Points are the primary "World Cup" metric.
    // Wait, D.2.3 mentions Reserve List comes from SOQCT.
    // This implies the main list might be heavily Points based.
    // I'll prioritize Points.

    // Iterate Points Ranking
    for (const skater of soqcPoints) {
        if (qualified.length >= maxQuota) break;
        tryQualify(skater, 'Points');
    }

    // If still space, use Times (though usually Points covers it if everyone has points)
    // But some might have fast times but low points (crashes, missed races).
    if (qualified.length < maxQuota) {
        for (const skater of soqcTimes) {
            if (qualified.length >= maxQuota) break;
            tryQualify(skater, 'Time');
        }
    }

    // Generate Reserve List (from SOQCT as per D.2.3)
    const reserve = [];
    for (const skater of soqcTimes) {
        const key = `${skater.name}|${skater.country}`;
        if (!qualifiedSkaters.has(key)) {
            // Check NOC max for reserve? Usually reserve also respects NOC max if they are already full?
            // D.2.3 doesn't explicitly say, but usually yes.
            // But reserve is for when a spot opens up.
            // Let's just list them.
            reserve.push(skater);
            if (reserve.length >= 8) break; // Reserve list size 8
        }
    }

    return { qualified, reserve, nocCounts };
}

// Helper: Compare time strings "34.56", "1:45.67"
function compareTimes(t1, t2) {
    return parseTime(t1) - parseTime(t2);
}

function parseTime(timeStr) {
    if (!timeStr) return Infinity;

    // Clean time string: remove "PB", newlines, etc.
    // Keep digits, colon, dot.
    const cleanTime = timeStr.replace(/[^0-9:.]/g, '');

    // Handle "1:45.67" -> seconds
    const parts = cleanTime.split(':');
    if (parts.length === 2) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(cleanTime);
}

module.exports = {
    calculateSOQCPoints,
    calculateSOQCTimes,
    allocateQuotas,
    EVENT_QUOTAS
};
