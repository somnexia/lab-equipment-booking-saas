const { Builder, Browser, By, until } = require('selenium-webdriver');

const cases = [
  require('./tc-e-03'),
  require('./tc-e-01'),
  require('./tc-e-02'),
  require('./tc-e-04'),
];

const ctx = {
  base: 'http://localhost:3000',
  email: 'student@chem.lab.local',
  password: 'Password123!',
  start: '2028-07-01T10:00',
  end: '2028-07-01T12:00',
  day: '2028-07-01',
};

async function runCase(name, fn) {
  try {
    await fn();
    console.log(name + ' Passed');
    return true;
  } catch (err) {
    console.log(name + ' Failed: ' + (err.message || err));
    return false;
  }
}

async function main() {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  const passed = new Set();
  let failed = 0;

  try {
    await driver.get(ctx.base + '/auth/login');
    await driver.wait(until.elementLocated(By.id('email')), 10000);

    for (const testCase of cases) {
      const missing = testCase.needs.filter((id) => !passed.has(id));
      if (missing.length) {
        console.log(testCase.id + ' Skipped: нужен ' + missing.join(', '));
        failed += 1;
        continue;
      }

      const ok = await runCase(testCase.id, () => testCase.run(driver, ctx));
      if (ok) passed.add(testCase.id);
      else failed += 1;
    }
  } finally {
    await driver.quit();
  }

  if (failed) {
    console.log('Не пройдено: ' + failed);
    process.exitCode = 1;
  } else {
    console.log('Все TC-E пройдены');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});