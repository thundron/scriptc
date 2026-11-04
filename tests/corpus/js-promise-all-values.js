function gather(values) { return Promise.all(values); }
const events = [];
gather([Promise.resolve(2), 3, undefined]).then(values => events.push(values.join(",")));
Promise.resolve().then(() => events.push("tick"));
events.push("sync");
console.log((await gather(["a", Promise.resolve("b")])).join(","));
console.log(events.join(";"));
console.log((await gather([])).length);
const error = new Error("rejected");
try { await gather([Promise.reject(error), Promise.resolve(5)]); }
catch (caught) { console.log(caught === error, caught.message); }
const invalid = gather({});
console.log("returned");
try { await invalid; } catch (caught) { console.log(caught.name); }
class Dependencies {
  /** @returns {Promise<object[]>} */
  get(type) { return Promise.resolve([{type}]); }
  run() {
    const self = this;
    return Promise.resolve().then(function () {
      return Promise.all([self.get('scene'), self.get('animation')]);
    });
  }
  nested() {
    return Promise.all([
      Promise.all([this.get('node')]),
      Promise.all([{ name: 'track' }]),
    ]).then(function (groups) {
      return groups[0][0][0].type + ':' + groups[1][0].name;
    });
  }
}
const loader = new Dependencies();
const method = loader.run;
console.log((await method.call(loader)).map(group => group[0].type).join(','));
console.log(await loader.nested());
