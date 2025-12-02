const fs = require('fs');
const { discoverWorldCups, fetchEventData } = require('./data_fetcher_v2');
const { calculateSOQCPoints, calculateSOQCTimes, calculateTeamPursuitPoints, calculateTeamPursuitTimes, allocateQuotas, applyHostCountryPromotion, EVENT_CONFIG } = require('../logic/qualification_rules_v2');

// In-memory store
const state = {
    events: [], // Will be auto-discovered
    raceResults: {}, // { eventId: [{ distance, gender, name, results: [] }] }
    soqc: {}, // { distance: { points: [], times: [], quotas: {} } }
    lastUpdated: null,
    isUpdating: false
};

// Distances to track
const DISTANCES = ['500m', '1000m', '1500m', '3000m', '5000m', '10000m', 'Mass Start', 'Team Pursuit'];

async function updateData() {
    if (state.isUpdating) return;
    state.isUpdating = true;
    fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] Starting update...\n`);

    try {
        // Discover World Cup events if not already done
        if (state.events.length === 0) {
            fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] Discovering World Cup events...\n`);
            const allEvents = await discoverWorldCups();
            // Limit to first 2 events for faster loading
            state.events = allEvents.slice(0, 2);
            fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] Using ${state.events.length} of ${allEvents.length} events\n`);
        }

        // Fetch data for each event
        for (const event of state.events) {
            fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] Fetching data for ${event.title} (${event.id})\n`);

            const races = await fetchEventData(event.id);
            state.raceResults[event.id] = races;

            fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] Got ${races.length} races\n`);
        }

        // Recalculate SOQC after all data is fetched
        recalculateSOQC();
        state.lastUpdated = new Date();
        fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] Update complete.\n`);

    } catch (error) {
        fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] ERROR: ${error.message}\n`);
        console.error("Error updating data:", error);
    } finally {
        state.isUpdating = false;
    }
}

function recalculateSOQC() {
    console.log("Recalculating SOQC...");
    fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] Recalculating SOQC...\n`);

    // Aggregate results by distance and gender
    const aggregatedResults = {}; // { 'distance-gender': [all_results] }

    for (const eventId in state.raceResults) {
        const races = state.raceResults[eventId];

        for (const race of races) {
            const key = `${race.distance}-${race.gender}`;
            if (!aggregatedResults[key]) aggregatedResults[key] = [];

            // Add eventId and race info to results for context
            const resultsWithContext = race.results.map(r => ({
                ...r,
                eventId,
                distance: race.distance,
                gender: race.gender
            }));
            aggregatedResults[key].push(...resultsWithContext);
        }
    }

    // Calculate Rankings and Quotas for each distance/gender combination
    state.soqc = {}; // Reset

    for (const key in aggregatedResults) {
        const [distance, gender] = key.split('-');

        // Map to EVENT_CONFIG key (e.g., '5000m-men' -> '5000m-M')
        let eventKey = distance;
        if (distance === '5000m') {
            eventKey = gender === 'men' ? '5000m-M' : '5000m-W';
        } else if (distance === '3000m' && gender === 'women') {
            eventKey = '3000m';
        } else if (distance === '10000m' && gender === 'men') {
            eventKey = '10000m';
        }

        // Skip if no config for this event
        if (!EVENT_CONFIG[eventKey]) continue;

        // Team Pursuit uses country-based aggregation instead of individual
        let pointsRanking, timesRanking;
        if (distance === 'Team Pursuit') {
            pointsRanking = calculateTeamPursuitPoints(aggregatedResults[key]);
            timesRanking = calculateTeamPursuitTimes(aggregatedResults[key]);
        } else {
            pointsRanking = calculateSOQCPoints(aggregatedResults[key]);
            timesRanking = calculateSOQCTimes(aggregatedResults[key]);
        }
        const quotas = allocateQuotas(eventKey, pointsRanking, timesRanking);

        // Apply host country (Italy) promotion if they're on reserve list
        const finalQuotas = applyHostCountryPromotion(quotas);

        // Store results with a display key (e.g., '500m' for both men and women)
        // We'll merge men/women under same distance key for now
        if (!state.soqc[distance]) {
            state.soqc[distance] = {
                points: pointsRanking,
                times: timesRanking,
                quotas: {
                    qualified: [],
                    reserve: []
                }
            };
        }

        // Combine points and times qualifiers into single qualified list
        const qualified = [
            ...finalQuotas.pointsQualifiers.map(s => ({ ...s, method: 'Points' })),
            ...finalQuotas.timesQualifiers.map(s => ({ ...s, method: 'Times' }))
        ];

        state.soqc[distance].quotas.qualified.push(...qualified);
        state.soqc[distance].quotas.reserve.push(...finalQuotas.reserve.map(s => ({ ...s, method: 'Reserve' })));

        fs.appendFileSync('store_debug.log', `[${new Date().toISOString()}] SOQC ${key}: ${qualified.length} qualified (${finalQuotas.pointsQualifiers.length} points, ${finalQuotas.timesQualifiers.length} times)\n`);
    }
}

function getState() {
    return state;
}

module.exports = {
    updateData,
    getState
};
