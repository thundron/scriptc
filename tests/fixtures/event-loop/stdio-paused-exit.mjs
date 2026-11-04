const input = process.stdin;
input.on('data', () => { throw new Error('paused data ran'); });
input.pause();
console.log('exit', input.isPaused());
