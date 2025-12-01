// Qualification Rules for Milan 2026 Speed Skating - CORRECTED

// Event quotas and splits
const EVENT_CONFIG = {
    // Short distances (28 total: 21 points + 7 times)
    '500m': { total: 28, fromPoints: 21, fromTimes: 7, maxPerNOC: 3, reserve: 8 },
    '1000m': { total: 28, fromPoints: 21, fromTimes: 7, maxPerNOC: 3, reserve: 8 },
    '1500m': { total: 28, fromPoints: 21, fromTimes: 7, maxPerNOC: 3, reserve: 8 },

    // Mid distances (20 total: 15 points + 5 times)
    '3000m': { total: 20, fromPoints: 15, fromTimes: 5, maxPerNOC: 3, reserve: 8 },
    '5000m-M': { total: 20, fromPoints: 15, fromTimes: 5, maxPerNOC: 3, reserve: 8 },

    // Long distances (12 total: 9 points + 3 times)
    '5000m-W': { total: 12, fromPoints: 9, fromTimes: 3, maxPerNOC: 2, reserve: 8 },
    '10000m': { total: 12, fromPoints: 9, fromTimes: 3, maxPerNOC: 2, reserve: 8 },

    // Mass Start (24 from points only)
    'Mass Start': { total: 24, fromPoints: 24, fromTimes: 0, maxPerNOC: 2, reserve: 8 }
};

/**
 * Calculate SOQC Points Ranking
 * Aggregates World Cup points for each skater
 */
function calculateSOQCPoints(results) {
    const skaterData = {};

    results.forEach(result => {
        const key = `${result.name}|${result.country}`;
        if (!skaterData[key]) {
            skaterData[key] = {
                name: result.name,
                country: result.country,
                totalPoints: 0,
                bestTime: '99:99.99',
                races: []
            };
        }

        const points = parseInt(result.points) || 0;
        skaterData[key].totalPoints += points;
        skaterData[key].races.push(result);

        // Track best time for tie-breaking
        if (result.time && compareTimes(result.time, skaterData[key].bestTime) < 0) {
            skaterData[key].bestTime = result.time;
        }
    });

    // Sort by points (descending), then by best time (ascending)
    return Object.values(skaterData).sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
        }
        return compareTimes(a.bestTime, b.bestTime);
    });
}

/**
 * Calculate SOQC Times Ranking
 * Ranks skaters by their best time
 */
function calculateSOQCTimes(results) {
    const skaterData = {};

    results.forEach(result => {
        const key = `${result.name}|${result.country}`;
        if (!skaterData[key]) {
            skaterData[key] = {
                name: result.name,
                country: result.country,
                bestTime: '99:99.99',
                totalPoints: 0
            };
        }

        if (result.time && compareTimes(result.time, skaterData[key].bestTime) < 0) {
            skaterData[key].bestTime = result.time;
        }

        // Track points for tie-breaking
        const points = parseInt(result.points) || 0;
        skaterData[key].totalPoints += points;
    });

    // Sort by best time (ascending), then by points (descending)
    return Object.values(skaterData)
        .filter(s => s.bestTime !== '99:99.99')
        .sort((a, b) => {
            const timeCompare = compareTimes(a.bestTime, b.bestTime);
            if (timeCompare !== 0) return timeCompare;
            return b.totalPoints - a.totalPoints;
        });
}

/**
 * Allocate quotas based on SOQC rankings with correct splits
 */
function allocateQuotas(eventKey, soqcPoints, soqcTimes) {
    const config = EVENT_CONFIG[eventKey];
    if (!config) {
        console.error(`Unknown event: ${eventKey}`);
        return { pointsQualifiers: [], timesQualifiers: [], reserve: [], nocCounts: {} };
    }

    const pointsQualifiers = [];
    const timesQualifiers = [];
    const reserve = [];
    const nocCounts = {};
    const qualifiedKeys = new Set();

    // Helper to check if skater can qualify under NOC limits
    function canQualify(skater) {
        const key = `${skater.name}|${skater.country}`;
        if (qualifiedKeys.has(key)) return false;

        const currentCount = nocCounts[skater.country] || 0;
        return currentCount < config.maxPerNOC;
    }

    function addQualifier(skater, list) {
        const key = `${skater.name}|${skater.country}`;
        qualifiedKeys.add(key);
        nocCounts[skater.country] = (nocCounts[skater.country] || 0) + 1;
        list.push(skater);
    }

    // Allocate from SOQC Points
    for (const skater of soqcPoints) {
        if (pointsQualifiers.length >= config.fromPoints) break;
        if (canQualify(skater)) {
            addQualifier(skater, pointsQualifiers);
        }
    }

    // Allocate from SOQC Times
    for (const skater of soqcTimes) {
        if (timesQualifiers.length >= config.fromTimes) break;
        if (canQualify(skater)) {
            addQualifier(skater, timesQualifiers);
        }
    }

    // Generate Reserve List (from SOQCT as per D.2.3)
    // Rule: "The top 8 unqualified athletes will form the reserve list, with athletes from unqualified countries having priority."
    // Interpretation: Take top 8 by time, THEN prioritize unqualified NOCs within that group.

    const reserveCandidates = [];

    for (const skater of soqcTimes) {
        const key = `${skater.name}|${skater.country}`;
        if (!qualifiedKeys.has(key)) {
            // Check if NOC is already full
            if (canQualify(skater)) {
                reserveCandidates.push(skater);
            }
        }
    }

    // 1. Take top N candidates by time (already sorted)
    const topCandidates = reserveCandidates.slice(0, config.reserve);

    // 2. Split into priority groups
    const priorityGroup = []; // NOCs with 0 quotas
    const normalGroup = [];   // NOCs with > 0 quotas

    for (const skater of topCandidates) {
        const count = nocCounts[skater.country] || 0;
        if (count === 0) {
            priorityGroup.push(skater);
        } else {
            normalGroup.push(skater);
        }
    }

    // 3. Combine
    const sortedReserve = [...priorityGroup, ...normalGroup];

    // 4. Assign to reserve
    reserve.push(...sortedReserve);

    return { pointsQualifiers, timesQualifiers, reserve, nocCounts };
}

// Helper: Compare time strings "34.56", "1:45.67"
function compareTimes(t1, t2) {
    return parseTime(t1) - parseTime(t2);
}

function parseTime(timeStr) {
    if (!timeStr) return Infinity;

    // Clean: remove "PB", "SB", "NR", newlines, etc.
    const cleanTime = timeStr.replace(/[^0-9:.]/g, '');

    // Handle "1:45.67" -> seconds
    const parts = cleanTime.split(':');
    if (parts.length === 2) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(cleanTime) || Infinity;
}

module.exports = {
    calculateSOQCPoints,
    calculateSOQCTimes,
    allocateQuotas,
    EVENT_CONFIG
};
