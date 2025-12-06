const fs = require('fs');
const path = require('path');

// Read the comparison report
const reportPath = path.join(__dirname, 'comparison_report_v2.txt');
const content = fs.readFileSync(reportPath, 'utf8');

// Extract mismatches
const lines = content.split('\n');
const mismatches = {
    missing: [],
    extra: []
};

for (const line of lines) {
    if (line.includes('MISSING in App:')) {
        const match = line.match(/MISSING in App: (.+?) \(([A-Z]{3})\)/);
        if (match) {
            mismatches.missing.push({ name: match[1].trim(), country: match[2] });
        }
    } else if (line.includes('EXTRA in App:')) {
        const match = line.match(/EXTRA in App:\s+(.+)/);
        if (match) {
            mismatches.extra.push({ name: match[1].trim() });
        }
    }
}

console.log('=== MISMATCH ANALYSIS ===\n');
console.log(`Missing in App: ${mismatches.missing.length}`);
console.log(`Extra in App: ${mismatches.extra.length}`);
console.log(`Total: ${mismatches.missing.length + mismatches.extra.length}\n`);

// Analyze patterns
console.log('=== COMMON PATTERNS ===\n');

// Pattern 1: Case differences
console.log('1. Case/Format Differences:');
mismatches.missing.slice(0, 10).forEach(m => {
    const potential = mismatches.extra.find(e =>
        e.name.toLowerCase().replace(/[^a-z]/g, '') === m.name.toLowerCase().replace(/[^a-z]/g, '')
    );
    if (potential) {
        console.log(`  "${m.name}" → "${potential.name}"`);
    }
});

// Pattern 2: Spacing issues
console.log('\n2. Spacing/Diacritic Issues:');
const spacingIssues = mismatches.extra.filter(e => e.name.includes('  ') || e.name.match(/[ØÖÜÄÉÈÀÓÅÆŒß]\s+[A-Z]/));
spacingIssues.slice(0, 10).forEach(e => {
    console.log(`  "${e.name}"`);
});

// Pattern 3: Duplicate/partial names
console.log('\n3. Duplicate or Partial Names:');
const duplicates = mismatches.extra.filter(e => {
    const words = e.name.split(' ');
    return words.length > 2 && words[0] === words[1];
});
duplicates.forEach(e => {
    console.log(`  "${e.name}"`);
});

// Show some examples
console.log('\n=== SAMPLE MISMATCHES ===');
console.log('\nMissing (first 15):');
mismatches.missing.slice(0, 15).forEach(m => {
    console.log(`  - ${m.name} (${m.country})`);
});

console.log('\nExtra (first 15):');
mismatches.extra.slice(0, 15).forEach(e => {
    console.log(`  + ${e.name}`);
});
