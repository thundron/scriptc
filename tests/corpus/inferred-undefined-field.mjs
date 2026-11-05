class Executor {
  current = undefined;
  set(value) { this.current = value; }
  run() {
    const operation = this.current;
    console.log(operation._tag, operation.value);
  }
}
const executor = new Executor();
executor.set({ _tag: "Ready", value: 42 });
executor.run();
