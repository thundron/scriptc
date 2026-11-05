import * as Schema from "effect/Schema"
type Tree={readonly value:number;readonly children:ReadonlyArray<Tree>};const Tree:Schema.Codec<Tree>=Schema.Struct({value:Schema.Int,children:Schema.Array(Schema.suspend(()=>Tree))});console.log(JSON.stringify(Schema.decodeUnknownSync(Tree)({value:1,children:[{value:2,children:[]}]})))
