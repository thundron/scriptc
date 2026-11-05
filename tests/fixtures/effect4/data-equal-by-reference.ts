import * as Equal from "effect/Equal";const a=Equal.byReference({n:42});const b=Equal.byReference({n:42});console.log(Equal.equals(a,a),Equal.equals(a,b))
