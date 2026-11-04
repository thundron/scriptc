import { consume, close, fail, same, custom } from "./consumer.js";

function* values(): Generator<string, string, unknown> {
  try {
    const sent = yield "first";
    return "received:" + (sent as string);
  } finally {
    console.log("cleanup");
  }
}

consume(values);
close(values());
fail(values());
const iterator = values();
console.log(same(iterator, iterator));
console.log((iterator as unknown as Generator<string, string, unknown>).next().value);
iterator.return("finished");
custom();
