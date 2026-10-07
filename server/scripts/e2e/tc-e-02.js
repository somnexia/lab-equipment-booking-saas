const { By, until } = require('selenium-webdriver');

// By - это объект Selenium, в котором лежат готовые локаторы для поиска элементов на странице.
// until - это набор helper-функций ожидания: until.elementLocated(...) ждёт, пока элемент появится в DOM.

a
// Проверяет создание записи бронирования и наличие её в списке с активным статусом.
async function run(driver, ctx) {
  // driver.get(url) открывает нужную страницу в браузере.
  // ctx.base - это базовый URL приложения, например http://localhost:3000.

  await driver.get(ctx.base + '/bookings/new');

  // driver.wait(condition, timeout) ждёт, пока условие станет true, но не дольше timeout миллисекунд.
  // Здесь мы ждём, пока в выпадающем списке оборудования появится элемент option со значением '1'.
  // Это нужно, потому что список оборудования может подгружаться асинхронно и не появиться сразу.
  await driver.wait(async () => {
    // findElements(locator) возвращает массив всех найденных элементов по локатору.
    // По селектору '#equipment_id option' мы получаем все варианты оборудования.
    const options = await driver.findElements(By.css('#equipment_id option'));

    // Перебираем все варианты и смотрим, у какого value == '1'.
    // Это означает, что в списке есть оборудование с id=1.
    for (const option of options) {
      // getAttribute('value') возвращает значение атрибута value элемента HTML.
      // Например: <option value="1">... </option>
      if ((await option.getAttribute('value')) === '1') return true;
    }
    return false;
  }, 10000);

  // Заполняет форму создания брони через DOM.
  await driver.executeScript(
    `document.getElementById('equipment_id').value = '1';
     document.getElementById('start_time').value = arguments[0];
     document.getElementById('end_time').value = arguments[1];`,
    ctx.start,
    ctx.end
  );

  // Получает контейнер сообщений и отправляет форму.
  const message = await driver.findElement(By.id('message'));
  await driver.findElement(By.css('#bookingForm button[type="submit"]')).click();

  // Ожидает переход на список броней или текст ошибки после отправки формы.
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    if (url.includes('/bookings') && !url.includes('/bookings/new')) return true;
    const text = (await message.getText()).trim();
    if (text) throw new Error(text);
    return false;
  }, 15000);

  // Проверяет, что в таблице появилась запись на нужную дату со статусом Active.
  await driver.wait(until.elementLocated(By.css('#bookingsTable tr')), 10000);
  const tableText = await driver.findElement(By.id('bookingsTable')).getText();
  if (!tableText.includes(ctx.day) || !tableText.includes('Active')) {
    throw new Error('в списке нет Active на ' + ctx.day);
  }
}

module.exports = {
  id: 'TC-E-02',
  needs: ['TC-E-01'],
  run,
};