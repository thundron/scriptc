const { EventEmitter } = require('node:events');
function listener(first, second = 1) { console.log(first, second); }
const ee = new EventEmitter();
ee.on('value', listener);
ee.emit('value');
ee.emit('value', 1, 2);
ee.emit('value', undefined, undefined);
ee.emit('value', 'text', null);
