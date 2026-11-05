import { Vector, Select, choose } from 'inferred-returns';

const value = new Vector();
console.log(Select.choose(false, value).x, Select.choose(true, value));
console.log(choose(false, value).x, choose(true, value));
