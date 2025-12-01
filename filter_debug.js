const fs = require('fs');
const path = require('path');

let output = '';

function processContent(content) {
    const lines = content.split('\n');
    console.log(`Read ${lines.length} lines.`);
    lines.forEach(line => {
        if (line.includes('DEBUG') || line.includes('Loading') || line.includes('WC') || line.includes('Total')) {
            output += '--- LOG LINE FOUND ---\n';
            output += line + '\n';
        }
    });
    fs.writeFileSync('filtered_logs.txt', output, 'utf8');
    console.log('Written to filtered_logs.txt');
}

try {
    const content = fs.readFileSync('debug_output_8.txt', 'utf16le');
    processContent(content);
} catch (e) {
    console.log('UTF-16LE failed, trying UTF-8');
    const content = fs.readFileSync('debug_output_8.txt', 'utf8');
    processContent(content);
}
