// A function-local `const gb = []` in a JS file is tsc's EVOLVING array
// (inference starts at never[]) — never's f64 representation (the
// uninhabited stance) must not capture it, or a later dyn push
// ("expected number at $, got string") dynChecks strings into a number
// array. The empty literal routes to the JS dyn-array fallback instead:
// pushes of dyn values (JSON.parse results), strings, and numbers all
// land, and length/index/join read back through the keyed-dyn paths.
'use strict';

function viaDyn() {
  const gb = [];
  gb.push(JSON.parse('"s"'));
  gb.push(JSON.parse('2'));
  console.log('dyn:', gb.join('|'), gb.length, gb[0]);
}
viaDyn();

function viaNumbers() {
  const ns = [];
  for (let i = 0; i < 3; i++) ns.push(i * 10);
  console.log('nums:', ns.join(','), ns.length, ns[2]);
}
viaNumbers();

// An ANNOTATED empty literal keeps its slot (the contextual type wins
// over the evolving inference) — jsdoc types the binding.
function viaAnnotated() {
  /** @type {string[]} */
  const ss = [];
  ss.push('a');
  ss.push('b');
  console.log('ann:', ss.join('-'));
}
viaAnnotated();

// The mixed command tuple (test/common's pwdCommand shape): the inner
// empty literal taints the OUTER literal's own type with never[]
// ((string | never[])[]) — the whole value rides the checked-dynamic tree fallback
// instead of building a static (number[] | string)[] that fences at the
// union re-tag.
function viaMixedTuple() {
  const cmd = ['pwd', []];
  console.log('cmd:', cmd.length, cmd[1].length);
}
viaMixedTuple();

// The ternary form (the pwdCommand spelling): the dyn arm coerces into
// the ternary's union slot and the whole binding stays usable.
function viaTernary(win) {
  const cmd = win ? ['cmd.exe', ['/d', '/c', 'cd']] : ['pwd', []];
  console.log('tern:', cmd.length);
}
viaTernary(false);
viaTernary(true);

// Public array signatures can be backed by checked storage in JS methods.
// Concatenation validates the returned array before spreading its elements.
class Lines {
  /** @returns {string[]} */
  values() {
    return JSON.parse('["second","third"]');
  }
  render() {
    const before = ['first'];
    const after = before.concat(this.values());
    console.log('concat:', before.join('|'), after.join('|'));
  }
}
new Lines().render();

// Array predicates use ToBoolean on checked results, including objects.
const candidates = ['null', 'false', '0', '""', '{}'];
console.log('find:', candidates.find((value) => JSON.parse(value)));
console.log('find-index:', candidates.findIndex((value) => JSON.parse(value)));
console.log('find-last:', candidates.findLast((value) => JSON.parse(value)));
console.log('find-last-index:', candidates.findLastIndex((value) => JSON.parse(value)));
console.log('some:', candidates.some((value) => JSON.parse(value)));
console.log('every:', candidates.every((value) => JSON.parse(value)));
