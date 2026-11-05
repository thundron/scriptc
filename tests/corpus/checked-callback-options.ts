function execute(options: any): any {
  return options.run(options.initial);
}
const answer = execute({ initial: 21, run: (value: any) => value * 2 });
console.log(answer);
const pair: [any, any] = [answer, "done"];
const [value, label] = pair;
console.log(value, label);
