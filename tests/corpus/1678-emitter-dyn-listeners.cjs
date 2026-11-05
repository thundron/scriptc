// The JS lane's checked-dynamic listeners: unannotated parameters register
// through the dyn-converting adapter (emit arguments box to dyn; extra
// parameters read undefined, extra arguments are ignored — JS-exact),
// while the ORIGINAL keeps the entry's identity for removeListener and
// listenerCount(name, fn). Non-function listeners throw Node's exact
// ERR_INVALID_ARG_TYPE TypeError, catchably.
'use strict';
const EventEmitter = require('events');
const ee = new EventEmitter();

ee.on('x', (a) => { console.log('arrow got', a, typeof a); });
ee.emit('x', 5);

function handler(a, b) { console.log('handler got', a, b); }
ee.on('y', handler);
ee.emit('y', 'str', 7);
console.log(ee.listenerCount('y', handler));
ee.removeListener('y', handler);
console.log(ee.listenerCount('y'));
ee.emit('y', 'gone', 0);

// A wrapper factory: each wrap is a fresh identity (mustCall's shape).
const wrap = (fn) => (a, b) => { fn(a, b); };
const once1 = wrap((a, b) => { console.log('once got', a, b); });
ee.once('z', once1);
ee.emit('z', 1, 2);
ee.emit('z', 3, 4);
console.log('count z', ee.listenerCount('z'));

// Extra parameters past the emitted tuple read undefined.
ee.on('extra', (a, b, c) => { console.log('extra', a, b, c); });
ee.emit('extra', 42, 'two');

// Zero-parameter listeners ignore every argument.
ee.on('zero', () => { console.log('zero-param ok'); });
ee.emit('zero', 9, 9);

// prepend/off through the dyn path.
const first = () => { console.log('first'); };
const second = () => { console.log('second'); };
ee.on('order', first);
ee.prependListener('order', second);
ee.emit('order');
ee.off('order', second);
ee.emit('order');

// Node's registration-family listener validation, byte for byte.
for (const bad of [5, null, 'oops', true]) {
  try {
    ee.on('bad', bad);
  } catch (e) {
    const er = /** @type {{code: string, message: string, name: string}} */ (e);
    console.log(er.name, er.code, er.message);
  }
}
console.log('done');

// One literal event name can carry different JS tuples, even on unrelated
// emitter instances. Keep actual argc, default arguments, and identities.
const variable = new EventEmitter();
const other = new EventEmitter();
/** @returns {*} */
function defaultValue() { console.log('default effect'); return 'default'; }
function varying(first, second = defaultValue()) {
  console.log('varying', first, second);
}
function countArguments() { console.log('argc', arguments.length); }
variable.on('resize', varying);
variable.on('resize', countArguments);
variable.prependOnceListener('resize', () => console.log('resize once'));
other.on('resize', (value) => console.log('other', value));
console.log('identity', variable.listenerCount('resize', varying));
console.log('emitted', variable.emit('resize'));
variable.emit('resize', 4, 5);
other.emit('resize', 'text');
variable.emit('resize', null, undefined);
variable.off('resize', varying);
variable.off('resize', countArguments);
console.log('removed', variable.listenerCount('resize'), variable.emit('resize', true));

// An implicit generic method's payload cannot be pinned by the syntactic
// prepass. Its instantiated body still supplies native checked values.
class Sized extends EventEmitter {
  resize(width, height) { this.emit('resized', { width, height }); }
}
const sized = new Sized();
sized.on('resized', (size) => console.log('size', size.width, size.height));
sized.on('resized', () => console.log('size ignored'));
sized.resize(3, 7);

function effect(value) { console.log('effect', value); return value; }
const effects = new EventEmitter();
effects.on('arguments', (first, second) => console.log('arguments', first, second));
effects.emit('arguments', effect('first'), effect('second'));
effects.emit('arguments', effect('only'));
