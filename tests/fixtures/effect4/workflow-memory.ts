import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as Workflow from "effect/workflow/Workflow"
import * as WorkflowEngine from "effect/workflow/WorkflowEngine"
import * as Layer from "effect/Layer"
const W=Workflow.make("Hello",{payload:{name:Schema.String},success:Schema.String,idempotencyKey:p=>p.name}); const layer=W.toLayer(p=>Effect.succeed("Hello "+p.name)); Effect.runPromise((W.execute({name:"world"}).pipe(Effect.provide(layer),Effect.provide(WorkflowEngine.layerMemory))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
