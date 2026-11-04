import { fileURLToPath } from "node:url";

for (const tail of [
  "ascii", "%20space", "%25percent", "%23hash", "%3Fquestion", "%00nul", "%C3%A9", "%E6%B0%B4", "%F0%9F%98%80",
  "%", "%0", "%GG", "%C0%AF", "%80", "%C2", "%E0", "%E0%A0", "%ED%A0%80", "%F0%80%80%80", "%F4%90%80%80",
  "%E0%A0x", "%C2%20", "%E0/%2F", "%2F/%E0", "%E0/%5C", "%25E0",
]) {
  const value = "file:///C:/work/" + tail;
  try { console.log("string", tail, JSON.stringify(fileURLToPath(value))); }
  catch (error) {
    if (error instanceof Error) console.log("string-error", tail, error.name, error.message, error instanceof URIError);
  }
  try { console.log("url", tail, JSON.stringify(fileURLToPath(new URL(value)))); }
  catch (error) {
    if (error instanceof Error) console.log("url-error", tail, error.name, error.message, error instanceof URIError);
  }
}
console.log("recovery", fileURLToPath("file:///C:/after/error").endsWith("error"));
