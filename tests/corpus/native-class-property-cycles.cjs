class Context {
  id = 1;
}
function createCycle() {
  const context = new Context();
  const view = /** @type {unknown} */ (context);
  view.self = view;
  view.nested = { owner: view };
  console.log(view.self === view, view.nested.owner === view, context.id);
}
for (let i = 0; i < 3; i++) createCycle();
