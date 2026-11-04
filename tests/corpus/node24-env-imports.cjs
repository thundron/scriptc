const util = require('node:util');
const processModule = require('node:process');
const fs = require('node:fs');
const os = require('node:os');
const directory = fs.mkdtempSync(os.tmpdir() + '/scriptc-env-imports-');
const path = directory + '/values.env';
console.log(JSON.stringify(util.parseEnv('B=two\nA=one')));
try {
  delete process.env.SCRIPTC_ENV_IMPORT;
  fs.writeFileSync(path, 'SCRIPTC_ENV_IMPORT=loaded');
  processModule.loadEnvFile(path);
  console.log(process.env.SCRIPTC_ENV_IMPORT);
  delete process.env.SCRIPTC_ENV_IMPORT;
  process.loadEnvFile(path);
  console.log(process.env.SCRIPTC_ENV_IMPORT);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
