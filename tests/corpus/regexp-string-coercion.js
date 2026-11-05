console.log('expression ' + new RegExp('a+', 'gi'));
console.log('expression ' + new RegExp(''));
console.log('expression ' + /b?/);
console.log('expression ' + new RegExp('x/y'));
console.log('expression ' + new RegExp('[a/]'));
console.log('expression ' + new RegExp('a\nb'));
for (const pattern of ['(', 'x{1}{1,}']) {
  try {
    console.log('expression ' + new RegExp(pattern));
  } catch (error) {
    console.log(error.name);
  }
}
