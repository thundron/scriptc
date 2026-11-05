// Named capture groups: exec/match results carry .groups — the record
// projection over the honest slice (values are the same capture slices
// m[i] holds). Printing the RAW groups object is deliberately absent:
// Node renders it with the [Object: null prototype] prefix (ledgered
// inspect divergence, the Object.groupBy stance).
const re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const m = re.exec("shipped 2024-07-15 (rev 9)");
if (m) {
  console.log(m[0], m[1], m[2], m[3]);
  console.log(m.groups!.year, m.groups!.month, m.groups!.day);
  const g = m.groups!;
  console.log(`${g.year}/${g.month}/${g.day}`);
}

// The match() spelling produces the same shape.
const mm = "v1.22.333".match(/(?<maj>\d+)\.(?<min>\d+)\.(?<pat>\d+)/);
console.log(mm!.groups!.maj, mm!.groups!.min, mm!.groups!.pat);

// No named groups → .groups is undefined (numbered captures unaffected).
const plain = /(\d+)-(\d+)/.exec("7-9");
console.log(plain!.groups, plain!.groups === undefined, plain![1], plain![2]);

// Destructuring the groups object, flat and aliased.
const { year, month } = re.exec("due 1999-12-31")!.groups!;
console.log(year, month);
const { groups: gg } = re.exec("2010-10-11 ok")!;
console.log(gg!.day);

// Named groups through a const-stored regex (the parsing-helper shape).
const semver = /(?<m>\d+)\.(?<n>\d+)\.(?<p>\d+)/;
const parsed = "3.0.14+quic".match(semver);
console.log(parsed!.groups!.m, parsed!.groups!.n, parsed!.groups!.p);

// new RegExp over a literal string traces too.
const dyn = new RegExp("(?<word>\\w+)-(?<num>\\d+)");
const dm = dyn.exec("abc-42");
console.log(dm!.groups!.word, dm!.groups!.num);

// ES2025 duplicate names across alternatives: the participating one wins.
const size = /(?<len>\d+)px|(?<len>\d+)em/;
console.log(size.exec("14px")!.groups!.len, size.exec("9em")!.groups!.len);

// Groups objects are plain data: JSON round-trips and keys walk in group
// declaration order, exactly Node's own key order.
const kv = /(?<one>1)(?<two>2)(?<three>3)/.exec("123")!.groups!;
console.log(JSON.stringify(kv), Object.keys(kv).join(","));

// Nonparticipating groups preserve undefined and remain own properties.
const opt = /(?<head>x)(?<tail>y)?/.exec("x")!.groups!;
console.log(opt.head, opt.tail ? opt.tail : "(none)");
