const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('cucumber-report.json', 'utf8'));
  let total = 0;
  let passed = 0;
  let failed = 0;

  data.forEach(feature => {
    if (feature.elements) {
      feature.elements.forEach(scenario => {
        total++;
        const isFailed = scenario.steps.some(step => step.result && step.result.status !== 'passed');
        if (isFailed) {
          failed++;
        } else {
          passed++;
        }
      });
    }
  });

  console.log(`total=${total}`);
  console.log(`passed=${passed}`);
  console.log(`failed=${failed}`);
} catch (e) {
  console.log(`total=0`);
  console.log(`passed=0`);
  console.log(`failed=0`);
}
