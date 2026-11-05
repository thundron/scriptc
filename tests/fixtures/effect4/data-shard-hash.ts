import * as ShardId from "effect/cluster/ShardId"
import * as Hash from "effect/Hash"
import * as Equal from "effect/Equal"

const first = ShardId.make("default", 1)
const second = ShardId.make("default", 2)
console.log(first.toString(), second.toString())
console.log(Hash.hash(first), Hash.hash(second), Hash.string("default:1"), Hash.string("default:2"))
console.log(Equal.equals(first, second), Equal.equals(first, ShardId.make("default", 1)))
