const brand: unique symbol = Symbol.for("scriptc.typed.brand");
const text: unique symbol = Symbol("text");

class Typed {
  [brand]: boolean = true;
  [text]: string | undefined = undefined;
  read(): boolean {
    return this[brand];
  }
}
const typed = new Typed();
console.log(typed[brand], typed[text], typed.read());
typed[brand] = false;
typed[text] = "set";
console.log(typed[brand], typed[text], typed.read());
