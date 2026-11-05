'use strict';
module.exports = read;
const { name } = require('./dependency.cjs');
console.log('single: initialized');

function read() {
  return 'single:' + name;
}
