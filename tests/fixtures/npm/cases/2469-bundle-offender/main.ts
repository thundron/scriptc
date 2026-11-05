// Published type-only declarations check the consumer while runtime
// exports come from the package's shipped JavaScript.
import { look, type GhostShape } from "gtghost";

const g: GhostShape = { id: 4 };
console.log(look(), g.id);
