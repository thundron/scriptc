let shared = 0;
function setShared(value) { shared = value; }
setShared("global");
console.log("shared", typeof shared, shared);

function scoped(value) {
  let state = 0;
  const update = (next) => { state = next; };
  update(value);
  {
    let state = 0;
    const update = (next) => { state = next; };
    update("inner");
    console.log("shadow", typeof state, state);
  }
  console.log("scope", typeof state, state);
}
scoped("outer");
scoped(true);

/** @type {number} */ let annotated = 1;
function updateNumber(value) { annotated = value; }
updateNumber(4);
console.log("annotated", annotated);
