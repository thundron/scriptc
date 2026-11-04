'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.describe = describe;
module.exports.renamed = other;
const browser = require('./dependency.cjs');
console.log('member: initialized');

function describe() {
  return helper();
}

function helper() {
  return 'browser:' + browser.name;
}

function other() {
  return browser.name.toUpperCase();
}
