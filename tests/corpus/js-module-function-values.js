function invoke() { return parse("a"); }
function kind() { return typeof parse; }
console.log("before", kind());
try { invoke(); } catch (e) { console.log("early", e.name, e.message); }
var parse = (input = "", options = {}) => {
  const data = JSON.parse('{"name":"key"}');
  if (input === "") return null;
  if (options.extended) return { name: data.name, code: 7 };
  return { name: data.name, raw: input };
};
class Parser {
  read(input) { return parse(input, { extended: true }); }
}
console.log("after", invoke().raw, parse() === null, new Parser().read("x").code);
const saved = parse;
console.log(saved === parse, saved("b").name);

function invokeLexical() { return lexical("c"); }
try { invokeLexical(); } catch (e) { console.log("tdz", e.name, e.message); }
const lexical = (input = "") => input === "" ? null : { value: JSON.parse('"ok"'), raw: input };
const first = invokeLexical();
const second = lexical("d");
if (first !== null && second !== null) console.log(first.raw, second.value);

function invokeFallback() { return fallback("c"); }
try { invokeFallback(); } catch (e) { console.log("fallback-tdz", e.name, e.message); }
const fallback = (input = "", options = {}) => {
  const data = JSON.parse('"ok"');
  if (input === "") return null;
  if (options.extended) return { value: data, code: 7 };
  return { value: data, raw: input };
};
const third = invokeFallback();
const fourth = fallback("d");
if (third !== null && fourth !== null) console.log(third.raw, fourth.value);
