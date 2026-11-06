// process.stdin in paused mode through 'readable': each event drains the
// buffer with read(), one more event follows EOF, and 'end' comes after the
// read that finds the buffer empty.
const input = process.stdin;
let sawData = false;
let eofReadables = 0;
let text = '';
input.on('readable', () => {
  let reads = 0;
  let chunk;
  while ((chunk = input.read()) !== null) {
    text += String(chunk);
    reads++;
  }
  // Pipe writes can coalesce. Check data readiness and the EOF-only wake
  // without assuming one readable event per write.
  if (reads === 0) eofReadables++;
  else sawData = true;
});
input.on('end', () => {
  console.log('readable data', sawData, 'eof', eofReadables);
  console.log(JSON.stringify(text), input.readableLength);
});
