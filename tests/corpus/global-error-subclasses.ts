class Failure extends globalThis.Error {
  code = "E_FAILURE";
  constructor(message: string) {
    super(message);
    this.name = "Failure";
  }
}
class Invalid extends globalThis.TypeError {}

const failure = new Failure("failed");
console.log(failure.name, failure.message, failure.code);
console.log(failure instanceof Error, failure instanceof Failure);
const invalid = new Invalid("invalid");
console.log(invalid.name, invalid.message, invalid instanceof TypeError);
console.log(failure instanceof globalThis.Error, invalid instanceof globalThis.TypeError);
const erased: unknown = invalid;
console.log(erased instanceof globalThis.Error, erased instanceof globalThis.TypeError, erased instanceof globalThis.RangeError);

try { throw failure; } catch (error) {
  if (error instanceof Failure) console.log(error.message, error.code);
}
