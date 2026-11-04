import * as HttpServerResponse from "effect/http/HttpServerResponse"
console.log(JSON.stringify(HttpServerResponse.jsonUnsafe({message:"world"})))
