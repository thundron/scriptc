class CustomError extends Error {
  override toString(): string {
    return "custom(" + super.toString() + ")";
  }
}
class SpecificError extends CustomError {
  override toString(): string {
    return "specific(" + super.toString() + ")";
  }
}
class InheritedError extends SpecificError {}
class PlainError extends Error {}

function print(error: Error): void {
  console.log(error.toString());
  console.log(error["toString"]());
  console.log(String(error));
  console.log(`${error}`);
}
print(new Error("base"));
print(new TypeError("type"));
print(new PlainError("plain"));
print(new CustomError("one"));
print(new SpecificError("two"));
print(new InheritedError("three"));
const error: CustomError = new SpecificError("four");
console.log(error.toString());
