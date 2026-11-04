const values = JSON.parse('[1,2,3,4]');
values.length = 2;
console.log(values.length, values.join(','), Object.keys(values).join(','));
values.length = 2;
console.log(values.length, Object.hasOwn(values, '2'));
values[2] = 8;
console.log(values.join(','));
try { values.length = -1; } catch (error) { console.log(error.name); }
console.log(values.length);

const sealed = JSON.parse('[1,2,3]');
Object.seal(sealed);
try { sealed.length = 1; } catch (error) { console.log(error.name); }
console.log(sealed.length, sealed.join(','));

const frozen = JSON.parse('[1,2]');
Object.freeze(frozen);
try { frozen.length = 1; } catch (error) { console.log(error.name); }
console.log(frozen.length, frozen.join(','));
