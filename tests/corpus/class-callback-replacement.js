class Signal {
  constructor(label) { this.label = label; }
  changed() { console.log('default', this.label); }
  emit() { this.changed(); }
  replace(callback) { this.changed = callback; }
}
class Child extends Signal {
  changed() { console.log('child', this.label); }
  parent() { super.changed(); }
}
const first = new Signal('a'), second = new Signal('b'), child = new Child('c');
const original = first.changed;
first.emit(); second.emit(); child.emit();
let calls = 0;
function callback() { calls++; console.log('callback', this.label, calls); }
first.replace(callback); child.replace(callback);
console.log('identity', first.changed === callback, child.changed === callback);
first.emit(); second.emit(); child.emit(); child.parent();
original.call(second);
console.log('own', Object.hasOwn(first, 'changed'), Object.hasOwn(second, 'changed'));
const saved = first.changed;
first.replace(() => console.log('replacement'));
saved.call(second);
first.emit();
function dynamic(value) { value.changed(); }
dynamic(first); dynamic(child);
first.replace(undefined);
try { first.emit(); } catch (error) { console.log('invalid', error instanceof TypeError); }
function next() { first.replace(() => console.log('next')); return 'argument'; }
first.replace((value) => console.log('selected', value));
function invoke(value) { value.changed(next()); }
invoke(first);
first.emit();
const fresh = new Signal('fresh');
function install() { fresh.replace(() => console.log('installed')); return 1; }
function invokeFresh(value) { value.changed(install()); }
invokeFresh(fresh);
fresh.emit();
class PrivateSignal {
  #changed() { console.log('private'); }
  emit() { this.#changed(); }
}
const hidden = new PrivateSignal();
function shadowPrivate(value) { value['#changed'] = () => console.log('public'); }
shadowPrivate(hidden);
hidden.emit();
let created = 0;
function temporary() { created++; return new Signal('temporary-' + created); }
temporary().emit();
temporary().replace(callback);
console.log('created', created);
let current = new Signal('retained');
current.replace(function () { current = new Signal('new'); console.log('receiver', this.label); });
current.emit();
current.emit();
