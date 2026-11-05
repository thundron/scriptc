const empty = JSON.parse('[]');
Object.freeze(empty);
console.log(empty.sort().length, empty.reverse().length);
console.log(empty.fill(4).length, empty.copyWithin(0, 0).length);
for (const operation of [() => empty.push(), () => empty.pop(), () => empty.shift(), () => empty.unshift(), () => empty.splice(0, 0)]) {
  try { operation(); } catch (error) { console.log(error.name); }
}

const one = JSON.parse('[1]');
Object.freeze(one);
console.log(one.sort().join(','), one.reverse().join(','));
console.log(one.fill(9, 0, 0).join(','), one.copyWithin(0, 1).join(','));
try { one.fill(9); } catch (error) { console.log(error.name); }
try { one.copyWithin(0, 0); } catch (error) { console.log(error.name); }
console.log(one.join(','));

const two = JSON.parse('[2,1]');
Object.freeze(two);
try { two.sort(); } catch (error) { console.log(error.name); }
try { two.reverse(); } catch (error) { console.log(error.name); }
console.log(two.join(','));
