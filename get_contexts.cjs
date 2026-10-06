const fs = require('fs');

const files = [
    'src/components/DashboardView.tsx',
    'src/components/InventoryView.tsx',
    'src/components/SalesView.tsx',
    'src/components/ReportsView.tsx',
    'src/components/ManualStockModal.tsx',
    'src/context/InventoryContext.tsx'
];

files.forEach(f => {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
        if (line.includes('nameHi')) {
            console.log(`\n--- ${f}:${i + 1} ---`);
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 3);
            for (let j = start; j < end; j++) {
                console.log(lines[j]);
            }
        }
    });
});
