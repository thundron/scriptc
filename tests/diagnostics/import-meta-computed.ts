const key: "url" | "filename" = process.argv[2] === "url" ? "url" : "filename";
const computed = import.meta[key];
console.log(computed);
