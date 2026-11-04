import { createHash, createHmac } from "node:crypto";

const environment: Record<string, string | undefined> = { present: "hello" };
for (const name of ["present", "missing"]) {
  const value = environment[name];
  const text: string = value ?? "";
  console.log(createHash("sha256").update(text).digest("hex"));
  console.log(createHmac("sha256", "secret").update(text).digest("hex"));
  if (value !== undefined) console.log(createHash("sha256").update(value).digest("hex"));
}

const buffers: (Buffer | undefined)[] = [Buffer.from("hello"), undefined];
for (let index = 0; index < buffers.length; index++) {
  const buffer = buffers[index] ?? Buffer.from("");
  console.log(createHash("sha256").update(buffer).digest("hex"));
  console.log(createHmac("sha256", "secret").update(buffer).digest("hex"));
}
