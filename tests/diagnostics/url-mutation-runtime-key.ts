const u = new URL("https://h/a");
const key = process.argv[2] === "href" ? "href" : "search";
u[key] = "https://other.example/";
