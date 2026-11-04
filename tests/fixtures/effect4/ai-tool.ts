import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as Tool from "effect/ai/Tool"
import * as Toolkit from "effect/ai/Toolkit"
const t=Tool.make("double",{description:"Double a number",parameters:Schema.Struct({n:Schema.Number}),success:Schema.Number}); const kit=Toolkit.make(t); console.log(Object.keys(kit.tools))
