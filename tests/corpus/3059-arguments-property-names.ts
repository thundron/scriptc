// Property names in an arrow body are not reads of the enclosing arguments object.
interface Options { keys: string[]; arguments: string[] }

const make = (): { arguments: number } => ({ arguments: 1 });
console.log("literal", make().arguments);

const count = (options: Options): number => options.keys.length + options.arguments.length;
const later = (): number => count({ keys: ["a"], arguments: ["b", "c"] });
console.log("options", later());

const unpack = (): number => {
  const { arguments: value } = { arguments: 4 };
  return value;
};
console.log("binding", unpack());

const typed = (): number => {
  const value: { arguments: number } = { arguments: 5 };
  return value.arguments;
};
console.log("type", typed());

const withMethod = (): number => {
  const value = { arguments(): number { return 6; } };
  return value.arguments();
};
console.log("method", withMethod());

const withLabel = (): number => {
  let result = 0;
  arguments: {
    result = 7;
    break arguments;
  }
  return result;
};
console.log("label", withLabel());
