const riskData = [{score: 1, severity: 'low', def: 'def'}];
const t = `
    ${riskData.map(r => {
        return `<div>${r.score}</div>`;
    }).join('')}
`;
console.log("Success!");
