const { Builder, Browser, By, until, } = require('selenium-webdriver');

async function test() {
     let driver = await new Builder().forBrowser(Browser.CHROME).build()
        .forBrowser('chrome')
        .build();

    try {
        await driver.get('http://localhost:3001');

        console.log('Page title:', await driver.getTitle());
    } finally {
        await driver.quit();
    }
}

test();