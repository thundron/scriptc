import * as Cookies from "effect/http/Cookies"
const c=Cookies.set(Cookies.empty,"name","world");console.log(JSON.stringify(c))
