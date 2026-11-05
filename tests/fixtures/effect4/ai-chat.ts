import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import * as LanguageModel from "effect/ai/LanguageModel"
import * as Chat from "effect/ai/Chat"
const model=Layer.effect(LanguageModel.LanguageModel,LanguageModel.make({generateText:()=>Effect.succeed([{type:"text",text:"hello"},{type:"finish",reason:"stop",usage:{inputTokens:{total:1},outputTokens:{total:1}}}]),streamText:()=>Stream.empty}));Effect.runPromise((Effect.gen(function*(){const c=yield* Chat.empty;const a=yield* c.generateText({prompt:"Hello"});const b=yield* c.generateText({prompt:"Again"});const h=yield* Ref.get(c.history);return [a.text,b.text,h.content.length]}).pipe(Effect.provide(model))).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
