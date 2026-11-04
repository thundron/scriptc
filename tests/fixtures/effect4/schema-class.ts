import * as Schema from "effect/Schema"
class User extends Schema.Class<User>("User")({id:Schema.Int,name:Schema.NonEmptyString}) {} const u=User.make({id:42,name:"world"}); console.log(u instanceof User,JSON.stringify(Schema.encodeSync(User)(u)))
