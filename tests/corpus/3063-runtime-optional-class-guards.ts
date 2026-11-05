class Animal {
  name: string;
  constructor(name: string) { this.name = name; }
}

class Dog extends Animal {
  volume: number = 2;
  bark(): string { return "woof:" + this.name; }
  get sound(): string { return this.bark(); }
}

function isDog(animal: Animal): animal is Dog {
  return animal instanceof Dog;
}

function parameter(animal: Animal): string {
  return animal instanceof Dog ? animal.bark() : "-";
}

function optionalParameter(animal: Animal | undefined): string {
  return animal instanceof Dog ? animal.bark() : "-";
}

function loop(animals: Animal[]): void {
  for (const animal of animals) {
    if (!(animal instanceof Dog)) continue;
    console.log("instanceof", animal.bark());
  }
  for (const animal of animals) {
    if (!isDog(animal)) continue;
    console.log("predicate", animal.bark());
  }
}

function local(animals: Animal[], index: number): string {
  const animal = animals[index];
  if (animal === undefined || !isDog(animal)) return "-";
  return animal.bark() + ":" + animal.volume + ":" + animal.sound;
}

function truthy(animals: Animal[], index: number): string {
  const animal: Animal | undefined = animals[index];
  return animal && isDog(animal) ? animal.bark() : "-";
}

function captured(animals: Animal[]): () => string {
  const animal = animals[0];
  if (!(animal instanceof Dog)) return () => "-";
  return () => animal.bark();
}

const animals: Animal[] = [new Animal("plain"), new Dog("first"), new Dog("second")];
loop(animals);
console.log("map", animals.map((animal) => animal instanceof Dog ? animal.bark() : "-").join(","));
console.log("from", Array.from(animals, (animal) => isDog(animal) ? animal.bark() : "-").join(","));
animals.forEach((animal) => { if (animal instanceof Dog) console.log("forEach", animal.bark()); });
for (let index = 0; index < 4; index++) console.log("local", index, local(animals, index), truthy(animals, index));
console.log("parameter", parameter(new Animal("plain")), parameter(new Dog("param")));
console.log("optional parameter", optionalParameter(new Dog("optional")), optionalParameter(undefined));
console.log("capture", captured([new Dog("captured")])(), captured([])());

// Module storage also carries the array element's hidden undefined arm.
const globalAnimal = animals[1];
if (isDog(globalAnimal)) console.log("global", globalAnimal.bark());

let effects = 0;
class Speaker extends Animal {
  speak(message: string): string { return this.name + ":" + message; }
}
function claimsSpeaker(animal: Animal): animal is Speaker { return true; }

function missing(animals: Animal[]): void {
  const animal = animals[8];
  if (claimsSpeaker(animal)) console.log(animal.speak((effects++, "unreachable")));
}

try {
  missing(animals);
} catch (error) {
  console.log("missing", error instanceof TypeError, (error as Error).message, effects);
}
