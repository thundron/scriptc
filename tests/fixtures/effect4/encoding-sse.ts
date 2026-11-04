import * as Sse from "effect/encoding/Sse"
const values:unknown[]=[];const parser=Sse.makeParser(e=>values.push(e));parser.feed("event: message\ndata: hello\n\n");console.log(JSON.stringify(values))
