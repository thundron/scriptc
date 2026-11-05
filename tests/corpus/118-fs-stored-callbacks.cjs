'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const call = (fn, ...args) => new Promise((resolve, reject) => fn(...args, (error, value) => error ? reject(error) : resolve(value)));
async function main() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'scriptc-callback-'));
  const file = path.join(directory, 'data.txt');
  try {
    await call(fs.writeFile, file, 'one', { flag: 'wx', mode: 0o600 });
    await call(fs.appendFile, file, 'two');
    const controller = new AbortController();
    controller.abort();
    try { await call(fs.writeFile, file, 'cancelled', { signal: controller.signal }); } catch (error) { console.log(error.name, error.code); }
    console.log(await call(fs.readFile, file, 'utf8'));
    try { await call(fs.writeFile, file, 'lost', { flag: 'wx' }); } catch (error) { console.log(error.code); }
    const info = await call(fs.stat, file);
    console.log(info.isFile(), info.size);
    const copy = path.join(directory, 'copy.txt');
    await call(fs.copyFile, file, copy, fs.constants.COPYFILE_EXCL);
    console.log(await call(fs.readFile, copy, 'utf8'));
    const source = path.join(directory, 'source');
    const destination = path.join(directory, 'destination');
    await call(fs.mkdir, source);
    await call(fs.writeFile, path.join(source, 'a.txt'), 'copied');
    await call(fs.cp, source, destination, { recursive: true });
    console.log(await call(fs.readFile, path.join(destination, 'a.txt'), 'utf8'));
    try { await call(fs.stat, path.join(directory, 'missing')); } catch (error) { console.log(error.code); }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}
main();
