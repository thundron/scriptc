export const identity = value => value;
export const factory = () => value => "received:" + value;
export const variadicFactory = () => (...values) => values.join(":");

class DefaultValue {
  value = "default";
}
const defaultValue = new DefaultValue();
const withDefault_ = (callback, value = defaultValue) => {
  const receiver = { run() { return callback(value); } };
  return receiver.run();
};
export { withDefault_ as withDefault };
