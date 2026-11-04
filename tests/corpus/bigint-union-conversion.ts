type Input = string | number | boolean | bigint | null | undefined;

let evaluations = 0;
function source(value: Input): Input { evaluations++; return value; }
function convert(value: Input): void {
  try {
    // @ts-expect-error Nullish inputs intentionally exercise BigInt's TypeError.
    console.log("value", BigInt(source(value)).toString());
  }
  catch (error) { if (error instanceof Error) console.log("error", error.name, error.message); }
}

for (const value of ["123456789012345678901234567890", "0xFF", "", "invalid", 42, -0, 1.5, NaN, Infinity, true, false, 123456789012345678901234567890n, null, undefined] as Input[]) convert(value);
console.log("evaluations", evaluations);

class Literal {
  readonly value: Input;
  constructor(data: { value?: string | number | boolean | null; flags: number }) {
    const value = data.value;
    if ((data.flags & 1) !== 0 && value != null) {
      if (typeof value !== "string") throw new TypeError("expected decimal string");
      this.value = BigInt(value);
    } else this.value = value ?? undefined;
  }
}
console.log("constructor", new Literal({ value: "9007199254740993", flags: 1 }).value);

function captured(): void {
  let value: string | undefined = "12";
  const mutate = () => { value = undefined; };
  if (typeof value === "string") {
    mutate();
    try { console.log(BigInt(value)); }
    catch (error) { if (error instanceof Error) console.log("capture", error.name, error.message); }
  }
}
captured();
