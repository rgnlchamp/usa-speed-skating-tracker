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
    'Mass Start': { total: 24, fromPoints: 24, fromTimes: 0, maxPerNOC: 2, reserve: 8 },

    // Team Pursuit (8 teams: 6 from points + 2 from times)
    'Team Pursuit': { total: 8, fromPoints: 6, fromTimes: 2, maxPerNOC: 1, reserve: 4 }
};

/**
 * Calculate Team Pursuit SOQC Points Ranking
 * Aggregates World Cup points BY COUNTRY (not individual)
 */
/**
 * Calculate Team Pursuit SOQC Points Ranking
 * Aggregates World Cup points BY COUNTRY (not individual)
 */
function calculateTeamPursuitPoints(results) {
    const countryData = {};

    results.forEach(result => {
        const country = result.country;
        if (!countryData[country]) {
            countryData[country] = {
                name: country,  // For consistency with individual events
                country: country,
                totalPoints: 0,
                bestTime: '99:99.99',
                bestPlace: 999,
                races: []
            };
        }

        const points = parseInt(result.points) || 0;
        countryData[country].totalPoints += points;
        countryData[country].races.push(result);

        // Track best time for tie-breaking
        if (result.time && compareTimes(result.time, countryData[country].bestTime) < 0) {
            countryData[country].bestTime = result.time;
        }

        // Track best place for tie-breaking
        const rank = parseInt(result.rank) || 999;
        if (rank < countryData[country].bestPlace) {
            countryData[country].bestPlace = rank;
        }
    });

    // Sort by points (descending), then by best place (ascending), then by best time (ascending)
    return Object.values(countryData).sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
        }
        if (a.bestPlace !== b.bestPlace) {
            return a.bestPlace - b.bestPlace;
        }
        return compareTimes(a.bestTime, b.bestTime);
    });
}

function determineNextReallocation(reserve, nocCounts) {
    // "Next Eligible Reallocation" = iterate the official reserve list in order 
    // and select the first athlete whose NOC has 0 quota places in that event. 
    // If none exist, then select the first athlete regardless of NOC quota count.

    // Note: reserve is assumed to be in "Official Reserve List (SOQC order)"

    const priorityCandidate = reserve.find(skater => {
        const count = nocCounts[skater.country] || 0;
        return count === 0;
    });

    return priorityCandidate || reserve[0] || null;
}

/**
 * Calculate SOQC Times Ranking
 * Ranks countries by their best time
 */
function calculateTeamPursuitTimes(results) {
    const countryData = {};

    results.forEach(result => {
        const country = result.country;
        if (!countryData[country]) {
            countryData[country] = {
                name: country,
                country: country,
                bestTime: '99:99.99',
                totalPoints: 0
            };
        }

        if (result.time && compareTimes(result.time, countryData[country].bestTime) < 0) {
            countryData[country].bestTime = result.time;
        }

        // Track points for tie-breaking
        const points = parseInt(result.points) || 0;
        countryData[country].totalPoints += points;
    });

    // Sort by best time (ascending), then by points (descending)
    return Object.values(countryData)
        .filter(c => c.bestTime !== '99:99.99')
        .sort((a, b) => {
            const timeCompare = compareTimes(a.bestTime, b.bestTime);
            if (timeCompare !== 0) return timeCompare;
            return b.totalPoints - a.totalPoints;
        });
}

/**
 * Calculate SOQC Points Ranking
 * Aggregates World Cup points for each skater
 */
function calculateSOQCPoints(results) {
    const skaterData = {};

    // Helper to normalize names - removes trailing single letters that get attached during PDF parsing
    function normalizeName(name) {
        if (!name) return '';
        // Remove trailing single letter (like "Yukino Yoshida F" -> "Yukino Yoshida")
        return name.replace(/\s+[A-Z]$/i, '').trim();
    }

    results.forEach(result => {
        const cleanName = normalizeName(result.name);
        const key = `${cleanName}|${result.country}`;
        if (!skaterData[key]) {
            skaterData[key] = {
                name: result.name,
                country: result.country,
                totalPoints: 0,
                bestTime: '99:99.99',
                bestPlace: 999,
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

        // Track best place for tie-breaking
        const rank = parseInt(result.rank) || 999;
        if (rank < skaterData[key].bestPlace) {
            skaterData[key].bestPlace = rank;
        }
    });

    // Sort by points (descending), then by best place (ascending), then by best time (ascending)
    return Object.values(skaterData).sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
        }
        if (a.bestPlace !== b.bestPlace) {
            return a.bestPlace - b.bestPlace;
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

    // Helper to normalize names - removes trailing single letters that get attached during PDF parsing
    function normalizeName(name) {
        if (!name) return '';
        return name.replace(/\s+[A-Z]$/i, '').trim();
    }

    results.forEach(result => {
        const cleanName = normalizeName(result.name);
        const key = `${cleanName}|${result.country}`;
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
 * Helper to generate sorted reallocation list based on priority rules
 */
function generateReallocationList(reserve, nocCounts) {
    const priority = []; // NOCs with 0 quotas
    const others = [];   // NOCs with > 0 quotas

    reserve.forEach(skater => {
        const count = nocCounts[skater.country] || 0;
        if (count === 0) {
            priority.push(skater);
        } else {
            others.push(skater);
        }
    });

    return [...priority, ...others];
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
    // reserve is defined later
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
    // NOC limit (maxPerNOC) applies to TOTAL: qualified + reserve combined

    const reserveCandidates = [];
    const totalNocCounts = { ...nocCounts }; // Track qualified + reserves together

    for (const skater of soqcTimes) {
        const key = `${skater.name}|${skater.country}`;
        if (!qualifiedKeys.has(key)) {
            // Check if NOC would exceed max after adding to reserves
            const currentTotal = totalNocCounts[skater.country] || 0;
            if (currentTotal < config.maxPerNOC) {
                reserveCandidates.push(skater);
                // Increment total as we add to reserve candidates
                totalNocCounts[skater.country] = currentTotal + 1;
            }
        }
    }

    // 1. Take top N candidates (Official Reserve List) - DO NOT RE-SORT to preserve SOQC order
    const reserve = reserveCandidates.slice(0, config.reserve);

    // 2. Determine Next Eligible Reallocation (First item in sorted list)
    // 3. Generate Full Reallocation List (Sorted)
    const reallocationList = generateReallocationList(reserve, nocCounts);
    const nextReallocation = reallocationList.length > 0 ? reallocationList[0] : null;

    return { pointsQualifiers, timesQualifiers, reserve, reallocationList, nextReallocation, nocCounts };
}

/**
 * Apply host country promotion rule
 * If host country (Italy) is on reserve list, promote to qualified
 * This replaces the last qualified position
 */
function applyHostCountryPromotion(quotaResult, hostCountry = 'Italy') {
    const { pointsQualifiers, timesQualifiers, reserve, nocCounts, nextReallocation } = quotaResult;

    // Check if host country is on reserve list
    const hostIndex = reserve.findIndex(r => r.country === hostCountry || r.name === hostCountry);

    if (hostIndex === -1) {
        // Host country not on reserve list, no change needed
        return quotaResult;
    }

    // Host country is on reserve - promote them
    const hostEntry = reserve[hostIndex];

    // Remove from reserve
    reserve.splice(hostIndex, 1);

    // Determine which list to modify (prefer removing from times if available, else points)
    let removedEntry;
    if (timesQualifiers.length > 0) {
        // Remove last times qualifier
        removedEntry = timesQualifiers.pop();
    } else if (pointsQualifiers.length > 0) {
        // Remove last points qualifier
        removedEntry = pointsQualifiers.pop();
    } else {
        // No qualified entries to replace (shouldn't happen)
        return quotaResult;
    }

    // Add removed entry to front of reserve list
    reserve.unshift(removedEntry);

    // Add host country to appropriate qualified list based on their method
    // If they were ranked by times, add to times; otherwise points
    if (hostEntry.bestTime && hostEntry.bestTime !== '99:99.99') {
        timesQualifiers.push(hostEntry);
    } else {
        pointsQualifiers.push(hostEntry);
    }

    // Update NOC counts to reflect the swap
    const updatedNocCounts = { ...nocCounts };
    if (removedEntry) {
        updatedNocCounts[removedEntry.country] = (updatedNocCounts[removedEntry.country] || 1) - 1;
    }
    updatedNocCounts[hostEntry.country] = (updatedNocCounts[hostEntry.country] || 0) + 1;

    // Recalculate reallocation list and next reallocation with updated reserve and counts
    const newReallocationList = generateReallocationList(reserve, updatedNocCounts);
    const newNextReallocation = newReallocationList.length > 0 ? newReallocationList[0] : null;

    return {
        pointsQualifiers,
        timesQualifiers,
        reserve,
        reallocationList: newReallocationList,
        nextReallocation: newNextReallocation,
        nocCounts: updatedNocCounts
    };
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
    calculateTeamPursuitPoints,
    calculateTeamPursuitTimes,
    allocateQuotas,
    applyHostCountryPromotion,
    EVENT_CONFIG
};
