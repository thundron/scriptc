const input = process.stdin;
const chunks = [];
function removed() { throw new Error('removed listener ran'); }
input.on('data', removed);
input.removeListener('data', removed);
input.on('data', function(chunk) {
  chunks.push(String(chunk));
  console.log('receiver', this === input);
  input.pause();
  setTimeout(() => input.resume(), 20);
});
input.on('end', function() {
  console.log('end', this === input, chunks.join(''));
});
input.pause();
console.log('paused', input.isPaused());
setTimeout(() => {
  console.log('resume');
  input.resume();
}, 30);
