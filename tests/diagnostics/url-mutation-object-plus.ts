const u = new URL("https://h/a");
const value: any = { toString() { return "next"; } };
u.search += value;
