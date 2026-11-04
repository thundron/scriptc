import { closeSync } from 'node:fs';
const output = process.stdout;
const error = process.stderr;
function announce() {
  output.write('ready\n');
  error.write('starting\n');
}
announce();
function removed() { error.write('removed\n'); }
output.on('error', removed);
output.off('error', removed);
output.once('error', function(err) {
  error.write(`event ${this === output} ${err.code}\n`);
});
closeSync(1);
const result = output.write('lost', err => {
  error.write(`callback ${err ? err.message : 'none'}\n`);
});
error.write(`returned ${result}\n`);
