const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'comparison_report_v2.txt');
const content = fs.readFileSync(reportPath, 'utf8');

const lines = content.split('\n');
let inSection = false;

const outputPath = path.join(__dirname, 'men_500_report.md');
let output = '--- Men 500 Discrepancies ---\n';

for (const line of lines) {
    if (line.includes('Comparing: Men - 500')) {
        inSection = true;
    } else if (line.includes('Comparing: Men - 1000')) {
        inSection = false;
        break;
    }

    if (inSection) {
        output += line + '\n';
    }
}

fs.writeFileSync(outputPath, output);
console.log('Report written to men_500_report.md');
