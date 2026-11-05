export function enabled(options = {}) {
  return options.enabled ?? false;
}

export async function enabledAsync(options = {}) {
  return options.enabled ?? false;
}

const arrow = (options = {}) => !!options.enabled;
let defaults = 0;
function freshDefault() {
  defaults++;
  return {};
}
function increment(options = freshDefault()) {
  options.count = (options.count ?? 0) + 1;
  return options.count;
}
function isNull(options = {}) {
  return options === null;
}
function emptyPattern({} = {}) {
  return "present";
}
class Options {
  read(options = {}) {
    return options.enabled ?? false;
  }
}

export function run() {
  const alias = enabled;
  const local = (options = {}) => options.enabled ?? false;
  const named = function optionsValue(options = {}) { return options.enabled ?? false; };
  console.log("values", arrow(), arrow({ enabled: true }), alias(), alias({ enabled: true }));
  console.log("closures", local(undefined), local({ enabled: true }), named(), named({ enabled: true }));
  console.log("methods", new Options().read(), new Options().read({ enabled: true }));
  console.log("fresh", increment(), increment(undefined), increment(), increment({ count: 4 }), defaults);
  console.log("null", isNull(), isNull(undefined), isNull(null));
  console.log("pattern", emptyPattern(), emptyPattern(undefined), emptyPattern({ extra: 1 }));
  try {
    emptyPattern(null);
  } catch (error) {
    console.log("pattern error", error instanceof TypeError, error.message);
  }
  try {
    enabled(null);
  } catch (error) {
    console.log("property error", error instanceof TypeError);
  }
}
