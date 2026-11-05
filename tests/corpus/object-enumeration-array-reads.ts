const records: { first: number; second: number }[] = [{ first: 1, second: 2 }];
for (const record of records) console.log(Object.keys(record).join(","), Object.values(record).join(","), JSON.stringify(Object.entries(record)));
const dictionaries: Record<string, number>[] = [{ b: 2, a: 1 }];
for (const dict of dictionaries) console.log(Object.keys(dict).join(","), Object.values(dict).join(","), JSON.stringify(Object.entries(dict)));
const empty: Record<string, number>[] = [];
try { console.log(Object.values(empty[0])); }
catch (error) { console.log(error instanceof TypeError, error instanceof Error ? error.message : "unexpected"); }
try { console.log(Object.keys(records[20])); }
catch (error) { console.log(error instanceof TypeError, error instanceof Error ? error.message : "unexpected"); }
