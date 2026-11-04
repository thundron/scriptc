import * as Effect from "effect/Effect";
import * as Command from "effect/cli/Command";
import * as Flag from "effect/cli/Flag";
import * as Argument from "effect/cli/Argument";
import * as NodeServices from "@effect/platform-node/NodeServices";
const root=Command.make("tasks").pipe(Command.withSharedFlags({verbose:Flag.Boolean("verbose")}));
const create=Command.make("create",{name:Argument.String("name")},({name})=>Effect.gen(function*(){const options=yield* root;console.log(name,options.verbose)}));
const command=root.pipe(Command.withSubcommands([create]));
Effect.runPromise(Command.runWith(command,{version:"1.0.0"})(["--verbose","create","world"]).pipe(Effect.provide(NodeServices.layer)));
