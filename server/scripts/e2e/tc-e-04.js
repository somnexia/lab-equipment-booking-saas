const { By, until } = require('selenium-webdriver');

// run — сценарий отмены активной брони в таблице.
// driver — открытый браузер Selenium, ctx — контекст текущего прогона с данными о дате и параметрах теста.
// Функция ищет запись по нужному дню и статусу Active, нажимает Cancel, подтверждает подтверждение в браузере
// и ждёт, пока статус в таблице обновится с Active на Cancelled.
async function run(driver, ctx) {
  // findElements возвращает все строки tr внутри таблицы #bookingsTable.
  // Нам нужно найти ту строку, где есть нужная дата и активная бронь.
  const rows = await driver.findElements(By.css('#bookingsTable tr'));
  let cancelButton = null;

  // Проходим по строкам и ищем запись с нужной датой и статусом Active.
  // Как только находим подходящую строку, берём кнопку Cancel из этой строки и выходим.
  for (const row of rows) {
    const text = await row.getText();
    if (text.includes(ctx.day) && text.includes('Active')) {
      cancelButton = await row.findElement(By.css('.btn-cancel'));
      break;
    }
  }

  // Если подходящая активная бронь не найдена, выбрасываем понятную ошибку.
  if (!cancelButton) {
    throw new Error('кнопка Cancel для ' + ctx.day + ' не найдена');
  }

  // Нажимаем кнопку отмены, после чего на странице вызывается встроенный confirm.
  await cancelButton.click();
  // until.alertIsPresent() ждёт, пока браузер покажет окно подтверждения, не дольше 5 секунд.
  await driver.wait(until.alertIsPresent(), 5000);
  // accept() подтверждает диалог и позволяет продолжить отмену брони.
  await driver.switchTo().alert().accept();

  // Ждём, пока в таблице не появится та же дата, но уже со статусом Cancelled.
  // Это сигнализирует, что отмена успешно завершилась и данные перерисовались.
  await driver.wait(async () => {
    const nextRows = await driver.findElements(By.css('#bookingsTable tr'));
    for (const row of nextRows) {
      const text = await row.getText();
      if (text.includes(ctx.day) && text.includes('Cancelled')) return true;
    }
    return false;
  }, 10000);
}

module.exports = {
  id: 'TC-E-04',
  needs: ['TC-E-02'],
  run,
};