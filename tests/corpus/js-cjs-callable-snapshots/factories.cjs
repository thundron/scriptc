let create = (value = 1) => value + 10;
exports.create = create;
create = (value = 2) => value + 20;
exports.current = () => create();
const stable = () => 30;
exports.stable = stable;
exports.alias = stable;
