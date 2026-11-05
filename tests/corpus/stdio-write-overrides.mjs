const output = process.stdout;
const original = output.write;
const messages = [];
output.write = function(chunk, encoding, callback) {
  messages.push(`${this === output}:${typeof chunk}:${String(chunk).trim()}`);
  return false;
};
const result = output.write('direct');
console.log('console', -0, true);
output.write = original;
console.log(result, messages.join('|'));
output.write = function() { throw new Error('write failed'); };
console.log('swallowed');
try { output.write('throws'); } catch (error) { messages.push(error.message); }
output.write = original;
console.log(messages[messages.length - 1]);
output.write('6869\n', 'hex');
output.write('\n');
