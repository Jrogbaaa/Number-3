const fs = require('fs');

// Create test CSV content
let largeCsvContent = 'name,email,company,title\n';
for (let i = 1; i <= 10; i++) {
  largeCsvContent += `Lead ${i},lead${i}@example.com,Company ${i},Title ${i}\n`;
}

console.log('Generated CSV content:');
console.log('First 300 chars:', largeCsvContent.substring(0, 300));
console.log('Total length:', largeCsvContent.length);
console.log('Line count:', largeCsvContent.split('\n').filter(line => line.trim()).length);

// Write to file
fs.writeFileSync('test-parsing.csv', largeCsvContent);
console.log('✅ Test CSV file created: test-parsing.csv');

// Test with Node.js CSV parsing
const lines = largeCsvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',');
const dataRows = lines.slice(1);

console.log('Headers:', headers);
console.log('Data rows count:', dataRows.length);
console.log('First data row:', dataRows[0]);
console.log('Last data row:', dataRows[dataRows.length - 1]); 