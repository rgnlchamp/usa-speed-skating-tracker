const path = require('path');

const filenames = [
    '20_result_menteampursuit_b-signed_20251123164907.pdf',
    '21_result_womenteampursuit_a-1_20251123205603.pdf',
    '22_result_menteampursuit_a-signed_20251123205639.pdf'
];

function parseRaceText(filename) {
    const filenameMatch = path.basename(filename).match(/(\d+)_result_(men|women)_?([a-z0-9]+)_([ab])_?/i);

    let gender = 'unknown';
    let distance = 'unknown';
    let division = 'unknown';

    if (filenameMatch) {
        gender = filenameMatch[2].toLowerCase();
        let rawDistance = filenameMatch[3].toLowerCase();
        division = filenameMatch[4].toUpperCase();

        console.log(`Filename: ${filename}`);
        console.log(`  Match: ${JSON.stringify(filenameMatch)}`);
        console.log(`  Raw Distance: '${rawDistance}'`);

        if (rawDistance === 'massstart') distance = 'Mass Start';
        else if (rawDistance === 'teampursuit') distance = 'Team Pursuit';
        else if (rawDistance === 'teamprint') distance = 'Team Sprint';
        else if (rawDistance.match(/^\d+$/)) distance = rawDistance + 'm';
        else if (!rawDistance.endsWith('m') && rawDistance.match(/^\d+/)) distance = rawDistance;

        // Normalize distance
        if (distance.match(/^\d+$/)) distance += 'm';
    } else {
        console.log(`Filename: ${filename} - NO MATCH`);
    }

    return { distance, gender, division };
}

filenames.forEach(f => {
    const res = parseRaceText(f);
    console.log(`  -> Detected: ${res.distance} ${res.gender} Div ${res.division}\n`);
});
