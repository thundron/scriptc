const input = process.stdin;
input.pause();
console.log('initial', input.read() === null);
let text = '';
let polls = 0;
const timer = setInterval(() => {
  let chunk;
  while ((chunk = input.read()) !== null) text += String(chunk);
  if (text === 'hello' || ++polls > 100) {
    clearInterval(timer);
    input.pause();
    console.log('read', text, input.readableLength);
  }
}, 10);
