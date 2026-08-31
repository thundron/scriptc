const pattern = process.env.PATTERN ?? "x";
console.log("x".replaceAll(pattern, "y"));
console.log("x".replaceAll("", "y"));
