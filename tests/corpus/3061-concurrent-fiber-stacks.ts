// Simultaneous async and generator stacks retain independent locals; repeat
// the burst to also exercise completed stack reuse and idle reclamation.
async function work(gate: Promise<number>, index: number): Promise<number> {
  const state = [index, index + 1, index + 2];
  const g = frames(index);
  const first = String(g.next(0).value);
  const value = await gate;
  await Promise.resolve();
  const last = String(g.next(index).value);
  if (!g.next(0).done) console.log("unexpected suspension");
  return state[0]! + state[1]! + state[2]! + value + first.length + last.length;
}

function* frames(index: number): Generator<string, string, number> {
  const state = ["start-" + index, "end-" + index];
  const sent = yield state[0]!;
  return state[1]! + ":" + sent;
}

async function run(): Promise<void> {
  for (let pass = 0; pass < 3; pass++) {
    const gate = new Promise<number>((resolve) => {
      setTimeout(() => resolve(pass + 1), 1);
    });
    const jobs: Promise<number>[] = [];
    for (let i = 0; i < 256; i++) {
      jobs.push(work(gate, i));
    }
    const values = await Promise.all(jobs);
    let total = 0;
    for (let i = 0; i < values.length; i++) {
      total += values[i]!;
    }
    console.log(pass, total);
  }
}
run();
