const {By} = require("selenium-webdriver");

async function login(driver, email, password){
    const emailEl = await driver.findElement(By.id('email'));
    const passwordEl = awaitdriver.findElement(By.id('password'));
    await emailEl.clear();
    await passwordEl.clear();
    await emailEl.sendKeys(email);
    await passwordEl.sendKeys(password);
    await driver.findElement(By.css('#loginForm button[type="submit"]')).click();

}
module.exports = login;