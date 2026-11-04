import * as HttpClientRequest from "effect/http/HttpClientRequest"
const r=HttpClientRequest.get("https://example.com/path").pipe(HttpClientRequest.setHeader("x-test","yes"),HttpClientRequest.setUrlParams({n:"42"})); console.log(r.method,r.url,r.headers["x-test"])
