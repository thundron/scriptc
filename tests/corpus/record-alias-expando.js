'use strict';

function validate(value) {
  const evaluated = validate.evaluated;
  if (evaluated.dynamicProps) evaluated.props = undefined;
  if (evaluated.dynamicItems) evaluated.items = undefined;
  validate.errors = value.valid ? null : ['invalid'];
  return value.valid;
}
validate.evaluated = { dynamicProps: true, dynamicItems: true };

console.log(JSON.stringify(validate.evaluated));
console.log(validate.evaluated.extra);
console.log(Object.hasOwn(validate.evaluated, 'props'), Object.hasOwn(validate.evaluated, 'items'));
console.log(validate({ valid: true }), JSON.stringify(validate.errors));
console.log(Object.hasOwn(validate.evaluated, 'props'), Object.hasOwn(validate.evaluated, 'items'));
console.log(Object.keys(validate.evaluated).join(','));

const alias = validate.evaluated;
alias.extra = 7;
alias.dynamicProps = false;
console.log(validate.evaluated.extra, validate.evaluated.dynamicProps);
console.log(JSON.stringify(alias), Object.keys(alias).join(','));
console.log(validate({ valid: false }), JSON.stringify(validate.errors));
console.log(validate.evaluated === alias, alias.extra);
alias.self = alias;
console.log(alias.self === alias, validate.evaluated.self === alias);

function flags() { return { ready: true }; }
const value = flags(), other = value;
other.extra = 'live';
value.ready = false;
console.log(value.extra, other.ready, JSON.stringify(value));

const frozen = Object.freeze(flags());
try {
  frozen.extra = 1;
  console.log('unexpected frozen write');
} catch (error) {
  console.log('frozen', error instanceof TypeError, Object.hasOwn(frozen, 'extra'));
}

function factory(start) {
  const fn = () => ++start;
  fn.label = 'first';
  return fn;
}
const fn = factory(3), callableAlias = fn;
callableAlias.label = 'second';
console.log(fn(), callableAlias(), fn.label, Object.keys(fn).join(','), Object.hasOwn(fn, 'label'));
delete callableAlias.label;
console.log(Object.hasOwn(fn, 'label'), Object.keys(fn).length);
