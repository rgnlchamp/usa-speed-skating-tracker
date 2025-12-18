const fs = require('fs');
const { fetchEventDataFromPDFs } = require('./pdf_data_fetcher');
const { calculateSOQCPoints, calculateSOQCTimes, calculateTeamPursuitPoints, calculateTeamPursuitTimes, allocateQuotas, applyHostCountryPromotion, EVENT_CONFIG } = require('../logic/qualification_rules_v2');
const manualOverrides = require('./manual_overrides');
const { scrapeMassStartStandings } = require('./mass_start_scraper');

// In-memory store
const state = {
    events: [{ id: 'WC1', title: 'World Cup #1 - Salt Lake City', date: '14-16 Nov 2025' }],
    raceResults: {}, // { eventId: [{ distance, gender, name, results: [] }] }
    soqc: {}, // { 'distance-gender': { points: [], times: [], quotas: {} } }
    lastUpdated: null,
    isUpdating: false
};

// Distances to track
const DISTANCES = ['500m', '1000m', '1500m', '3000m', '5000m', '10000m', 'Mass Start', 'Team Pursuit'];

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

        // Apply Manual Overrides
        if (manualOverrides && manualOverrides.length > 0) {
            console.log(`Applying ${manualOverrides.length} manual overrides...`);
            manualOverrides.forEach(override => {
                const { eventId, distance, gender, division, ...resultData } = override;

                if (!state.raceResults[eventId]) {
                    state.raceResults[eventId] = [];
                }

                // Check if a race entry for this distance/gender/division already exists to append to
                let raceEntry = state.raceResults[eventId].find(r =>
                    r.distance === distance &&
                    r.gender === gender &&
                    (!division || r.division === division)  // Match division if specified
                );

                if (!raceEntry) {
                    // Create new race entry if it doesn't exist
                    raceEntry = {
                        distance,
                        gender,
                        name: `${distance} ${gender.charAt(0).toUpperCase() + gender.slice(1)} (Manual Override)`,
                        results: []
                    };
                    state.raceResults[eventId].push(raceEntry);
                }

                // Add the override result
                raceEntry.results.push(resultData);
                console.log(`  + Added override for ${resultData.name} in ${distance} ${gender} (${eventId})`);
            });
        }

        console.log(`Loaded ${races.length} races from PDFs`);

        // Recalculate SOQC
        await recalculateSOQC();
        state.lastUpdated = new Date();
        console.log('Data update complete!');

    } catch (error) {
        console.error("Error updating data:", error);
    } finally {
        state.isUpdating = false;
    }
}

const TARGET_EVENTS = [
    { key: '500m-men', distance: '500m', gender: 'men', configKey: '500m' },
    { key: '500m-women', distance: '500m', gender: 'women', configKey: '500m' },
    { key: '1000m-men', distance: '1000m', gender: 'men', configKey: '1000m' },
    { key: '1000m-women', distance: '1000m', gender: 'women', configKey: '1000m' },
    { key: '1500m-men', distance: '1500m', gender: 'men', configKey: '1500m' },
    { key: '1500m-women', distance: '1500m', gender: 'women', configKey: '1500m' },
    { key: '3000m-women', distance: '3000m', gender: 'women', configKey: '3000m', related: '5000m-women' },
    { key: '5000m-men', distance: '5000m', gender: 'men', configKey: '5000m-M', related: '10000m-men' },
    { key: '5000m-women', distance: '5000m', gender: 'women', configKey: '5000m-W', related: '3000m-women' },
    { key: '10000m-men', distance: '10000m', gender: 'men', configKey: '10000m', related: '5000m-men' },
    { key: 'Mass Start-men', distance: 'Mass Start', gender: 'men', configKey: 'Mass Start' },
    { key: 'Mass Start-women', distance: 'Mass Start', gender: 'women', configKey: 'Mass Start' },
    { key: 'Team Pursuit-men', distance: 'Team Pursuit', gender: 'men', configKey: 'Team Pursuit' },
    { key: 'Team Pursuit-women', distance: 'Team Pursuit', gender: 'women', configKey: 'Team Pursuit' }
];

async function recalculateSOQC() {
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

    // Calculate Rankings and Quotas for each target event
    state.soqc = {}; // Reset

    for (const target of TARGET_EVENTS) {
        const { key, distance, gender, configKey, related } = target;
        const aggKey = `${distance}-${gender}`;

        // Skip if no config (shouldn't happen with TARGET_EVENTS)
        if (!EVENT_CONFIG[configKey]) {
            console.warn(`Missing config for ${configKey}`);
            continue;
        }

        // Get results for this distance
        let pointsResults = aggregatedResults[aggKey] || [];
        let timesResults = aggregatedResults[aggKey] || [];

        // Combine points with related distance if applicable
        if (related) {
            const relatedResults = aggregatedResults[related] || [];
            console.log(`Aggregating points for ${key} from ${related}`);
            pointsResults = [...pointsResults, ...relatedResults];
        }

        // Mass Start uses ISU live standings (not PDFs) - top 24 qualify
        // Team Pursuit uses country-based aggregation instead of individual
        let pointsRanking, timesRanking;
        if (distance === 'Mass Start') {
            // Fetch live standings from ISU for Mass Start
            console.log(`Fetching ${key} from ISU live standings...`);
            const genderCode = gender === 'men' ? 'M' : 'F';
            const standings = await scrapeMassStartStandings(genderCode);

            // Convert ISU standings to our format
            pointsRanking = standings.map(skater => ({
                name: skater.name,
                country: skater.country,
                totalPoints: skater.totalPoints,
                bestTime: '', // No times for Mass Start
                bestPlace: skater.rank,
                races: [] // We don't track individual races for Mass Start
            }));

            timesRanking = []; // No times component for Mass Start
            console.log(`[SOQC] ${key}: Scraped Mass Start standings (Found: ${pointsRanking.length} skaters)`);
        } else if (distance === 'Team Pursuit') {
            pointsRanking = calculateTeamPursuitPoints(pointsResults);
            timesRanking = calculateTeamPursuitTimes(timesResults);
            console.log(`[SOQC] ${key}: Processed Team Pursuit (Points: ${pointsRanking.length}, Times: ${timesRanking.length})`);
        } else {
            pointsRanking = calculateSOQCPoints(pointsResults);
            timesRanking = calculateSOQCTimes(timesResults);

            // Create lookup maps for cross-enrichment
            const pointsLookup = new Map();
            const timesLookup = new Map();

            pointsRanking.forEach(skater => {
                const key = `${skater.name}|${skater.country}`;
                pointsLookup.set(key, skater.totalPoints);
            });

            timesRanking.forEach(skater => {
                const key = `${skater.name}|${skater.country}`;
                timesLookup.set(key, skater.bestTime);
            });

            // Enrich times ranking with total points from points ranking
            // This ensures times qualifiers show their full accumulated points
            timesRanking = timesRanking.map(skater => {
                const key = `${skater.name}|${skater.country}`;
                const totalPoints = pointsLookup.get(key) || skater.totalPoints;
                return { ...skater, totalPoints };
            });

            // Enrich points ranking with best time from THIS distance only
            // This ensures points qualifiers show their best time for the specific distance
            pointsRanking = pointsRanking.map(skater => {
                const key = `${skater.name}|${skater.country}`;
                const bestTime = timesLookup.get(key) || skater.bestTime;
                return { ...skater, bestTime };
            });
        }
        const quotas = allocateQuotas(configKey, pointsRanking, timesRanking);

        // Apply host country (Italy) promotion if they're on reserve list
        const finalQuotas = applyHostCountryPromotion(quotas);

        // Store results
        state.soqc[key] = {
            distance,
            gender,
            points: pointsRanking,
            times: timesRanking,
            quotas: {
                qualified: [],
                reserve: [],
                reallocationList: [],
                nextReallocation: null
            }
        };

        // Combine points and times qualifiers into single qualified list
        const qualified = [
            ...finalQuotas.pointsQualifiers.map(s => ({ ...s, method: 'Points' })),
            ...finalQuotas.timesQualifiers.map(s => ({ ...s, method: 'Times' }))
        ];

        state.soqc[key].quotas.qualified = qualified;

        state.soqc[key].quotas.reserve = finalQuotas.reserve.map(s => ({ ...s, method: 'Reserve' }));
        state.soqc[key].quotas.reallocationList = finalQuotas.reallocationList.map(s => ({ ...s, method: 'Reserve' }));
        state.soqc[key].quotas.nextReallocation = finalQuotas.nextReallocation;

        console.log(`SOQC ${key}: ${qualified.length} qualified (${finalQuotas.pointsQualifiers.length} points, ${finalQuotas.timesQualifiers.length} times)`);
    }
}

function getState() {
    return state;
}

module.exports = {
    updateData,
    getState
};
