const factories = require('./factories.cjs');
console.log(factories.create(), factories.create(3));
console.log(factories.current(), factories.stable());
console.log(factories.alias === factories.stable);
