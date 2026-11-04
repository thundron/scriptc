const values = JSON.parse('[1,2,3,4]');
console.log(values.reduce((a, b) => a + b));
console.log(values.reduceRight((a, b) => a - b));
console.log(values.reduce((a, b) => a + b, 10));
console.log(values.findLast(x => x < 4), values.findLastIndex(x => x < 4));
console.log(values.findLast(x => x > 9), values.findLastIndex(x => x > 9));
try { JSON.parse('[]').reduce((a, b) => a + b); } catch (error) { console.log(error.name); }
console.log(JSON.parse('[]').reduce((a, b) => a + b, 5));
console.log(JSON.parse('[7]').reduce((a, b) => a + b));
console.log(JSON.parse('[7]').reduceRight((a, b) => a + b));
const shrinking = JSON.parse('[1,2,3]');
const seen = [];
const found = shrinking.findLast((value, index) => {
  seen.push(`${index}:${value}`);
  if (index === 2) shrinking.length = 1;
  return false;
});
console.log(found, seen.join(','), shrinking.join(','));
