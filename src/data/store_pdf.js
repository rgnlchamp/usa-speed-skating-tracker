const fs = require('fs');
const { fetchEventDataFromPDFs } = require('./pdf_data_fetcher');
const { calculateSOQCPoints, calculateSOQCTimes, allocateQuotas, EVENT_CONFIG } = require('../logic/qualification_rules_v2');

// In-memory store
const state = {
    events: [{ id: 'WC1', title: 'World Cup #1 - Salt Lake City', date: '14-16 Nov 2025' }],
    raceResults: {}, // { eventId: [{ distance, gender, name, results: [] }] }
    soqc: {}, // { 'distance-gender': { points: [], times: [], quotas: {} } }
    lastUpdated: null,
    isUpdating: false
};

// Distances to track
const DISTANCES = ['500m', '1000m', '1500m', '3000m', '5000m', '10000m', 'Mass Start'];

async function updateData() {
    if (state.isUpdating) return;
    state.isUpdating = true;
    console.log('Loading data from PDF files...');

    try {
        // Load all PDF data
        const races = await fetchEventDataFromPDFs();

        // Group races by event
        state.raceResults = {};
        races.forEach((race, idx) => {
            const eventKey = `WC${race.eventNumber}`;
            if (idx < 3) console.log(`[DEBUG STORE] Race ${idx}: eventNumber="${race.eventNumber}", eventKey="${eventKey}", name="${race.name}"`);
            if (!state.raceResults[eventKey]) {
                state.raceResults[eventKey] = [];
            }
            state.raceResults[eventKey].push(race);
        });

        console.log(`Loaded ${races.length} races from PDFs`);

        // Recalculate SOQC
        recalculateSOQC();
        state.lastUpdated = new Date();
        console.log('Data update complete!');

    } catch (error) {
        console.error("Error updating data:", error);
    } finally {
        state.isUpdating = false;
    }
}

function recalculateSOQC() {
    console.log("Recalculating SOQC...");

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
        let relatedDistanceKey = null;

        if (distance === '5000m') {
            if (gender === 'men') {
                eventKey = '5000m-M';
                relatedDistanceKey = '10000m-men'; // Combine with 10k
            } else {
                eventKey = '5000m-W';
                relatedDistanceKey = '3000m-women'; // Combine with 3k
            }
        } else if (distance === '3000m' && gender === 'women') {
            eventKey = '3000m';
            relatedDistanceKey = '5000m-women'; // Combine with 5k
        } else if (distance === '10000m' && gender === 'men') {
            eventKey = '10000m';
            relatedDistanceKey = '5000m-men'; // Combine with 5k
        }

        // Skip if no config for this event
        if (!EVENT_CONFIG[eventKey]) continue;

        // Prepare results for Points Ranking (Aggregated for Long Distances)
        let pointsResults = [...aggregatedResults[key]];
        if (relatedDistanceKey && aggregatedResults[relatedDistanceKey]) {
            console.log(`Aggregating points for ${eventKey} from ${relatedDistanceKey}`);
            pointsResults = [...pointsResults, ...aggregatedResults[relatedDistanceKey]];
        }

        const pointsRanking = calculateSOQCPoints(pointsResults);
        const timesRanking = calculateSOQCTimes(aggregatedResults[key]); // Times only from specific distance
        const quotas = allocateQuotas(eventKey, pointsRanking, timesRanking);

        // Store results with distance-gender key to keep men/women separate
        state.soqc[key] = {
            distance,
            gender,
            points: pointsRanking,
            times: timesRanking,
            quotas: {
                qualified: [],
                reserve: []
            }
        };

        // Combine points and times qualifiers into single qualified list
        const qualified = [
            ...quotas.pointsQualifiers.map(s => ({ ...s, method: 'Points' })),
            ...quotas.timesQualifiers.map(s => ({ ...s, method: 'Times' }))
        ];

        state.soqc[key].quotas.qualified = qualified;
        state.soqc[key].quotas.reserve = quotas.reserve.map(s => ({ ...s, method: 'Reserve' }));

        console.log(`SOQC ${key}: ${qualified.length} qualified (${quotas.pointsQualifiers.length} points, ${quotas.timesQualifiers.length} times)`);
    }
}

function getState() {
    return state;
}

module.exports = {
    updateData,
    getState
};
