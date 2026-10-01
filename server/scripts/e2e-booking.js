// Builder - собирает объект браузера.
// Browser - хранит имя браузера, здесь Browser.CHROME.
// By - описывает, как найти элемент: по id или по CSS.
// until- описывает условие ожидания: появился элемент, 
// сменился адрес, текст стал нужным, появился диалог.
const { Builder, Browser, By, until } = require('selenium-webdriver');



// BASE, EMAIL, PASSWORD, START, END и DAY — данные прогона. 
// START и END пишутся в поля datetime-local. DAY потом ищется в тексте таблицы.
const BASE = 'http://localhost:3000';
const EMAIL = 'student@chem.lab.local';
const PASSWORD = 'Password123!';
const START = '2028-07-01T10:00';
const END = '2028-07-01T12:00';
const DAY = '2028-07-01';

// Вход в форму
// async означает, что функция ждёт ответы браузера. driver — это открытый Chrome. 
// findElement возвращает один элемент и падает, если его нет. 
// By.id('email') ищет input#email. 
// clear стирает старое значение, 
// иначе второй вход допишет буквы к первому. sendKeys печатает текст. 
// By.css('#loginForm button[type="submit"]') ищет кнопку Log in только внутри формы логина. 
// click нажимает её. Страница после этого сама вызывает POST /api/auth/login. 
// Функция клик делает, а переход на каталог не ждёт: это проверяет уже сам кейс.
async function login(driver, email, password) {
  const emailEl = await driver.findElement(By.id('email'));
  const passwordEl = await driver.findElement(By.id('password'));
  await emailEl.clear();
  await passwordEl.clear();
  await emailEl.sendKeys(email);
  await passwordEl.sendKeys(password);
  await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
}

// условия прогона теста
// fn — функция конкретного теста. 
// runCase её вызывает. Если она дошла до конца, в консоль пишется Passed и возвращается true. 
// Если внутри throw или Selenium не дождался элемента, пишется Failed и возвращается false. 
// Браузер из-за одного провала не закрывается: следующие кейсы ещё могут идти, 
// а quit стоит в finally ниже.
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
// Сборка, прогон и закрытие
// new Builder() создаёт сборщик.
// forBrowser(Browser.CHROME) выбирает Chrome.
// build() запускает браузер и возвращает driver. get открывает адрес. 

async function main() {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  let failed = 0;

// wait опрашивает страницу, пока условие не станет истинным, но не дольше 10 секунд. 
// until.elementLocated ждёт, пока в DOM появится #email. 
// Это нужно, потому что страница может ещё не дорисоваться.
  try {
    await driver.get(BASE + '/auth/login');
    await driver.wait(until.elementLocated(By.id('email')), 10000);

// TC-E-03 вводит неверный пароль и ждёт текст:
// elementTextIs - ждёт, пока текст #message станет ровно Invalid password. 
// getCurrentUrl - читает адресную строку. 
// includes - проверяет, что путь всё ещё /auth/login.
    const wrongPassword = await runCase('TC-E-03', async () => {
      await login(driver, EMAIL, 'WrongPassword');
      const message = await driver.findElement(By.id('message'));
      await driver.wait(until.elementTextIs(message, 'Invalid password'), 10000);
      const url = await driver.getCurrentUrl();
      if (!url.includes('/auth/login')) {
        throw new Error('страница ушла с логина: ' + url);
      }
    });
    if (!wrongPassword) failed += 1;

// // TC-E-01 ожидание правильной подстроки и заголока
// urlContains ждёт подстроку /dashboard до 15 секунд. 
// Логин отвечает не мгновенно: пароль считается через bcrypt. 
// Потом проверяется заголовок каталога.
    const loggedIn = await runCase('TC-E-01', async () => {
      await login(driver, EMAIL, PASSWORD);
      await driver.wait(until.urlContains('/dashboard'), 15000);
      const title = await driver.findElement(By.css('h1.page-title'));
      await driver.wait(until.elementTextIs(title, 'Equipment catalog'), 5000);
    });

// TC-E-02 и TC-E-04 запускаются только если предыдущий шаг вернул true: 
// без входа форму брони не открыть, без созданной строки нечего отменять.
    if (!loggedIn) {  
      failed += 1;
    } else {
      // TC-E-02 открывает форму и ждёт, пока список приборов загрузится с сервера. 
      const created = await runCase('TC-E-02', async () => {
        await driver.get(BASE + '/bookings/new');

// Условие ожидания здесь своя функция: она возвращает true, только когда среди option есть значение 1.
        await driver.wait(async () => {

// findElements возвращает массив, даже если он пустой.
          const options = await driver.findElements(By.css('#equipment_id option'));
          for (const option of options) {
//  getAttribute('value') читает атрибут value
            if ((await option.getAttribute('value')) === '1') return true;
          }
          return false;
        }, 10000);

// executeScript выполняет обычный JavaScript внутри страницы. Поля даты так заполняются надёжнее, 
// чем печатью с клавиатуры: у datetime-local свой формат ввода. 
// arguments[0] и arguments[1] — это START и END, переданные в скрипт.
        await driver.executeScript(
          `document.getElementById('equipment_id').value = '1';
           document.getElementById('start_time').value = arguments[0];
           document.getElementById('end_time').value = arguments[1];`,
          START,
          END
        );

        const message = await driver.findElement(By.id('message'));
        await driver.findElement(By.css('#bookingForm button[type="submit"]')).click();

// getText читает видимый текст. Успех — адрес /bookings, но не /bookings/new. 
// Если форма показала ошибку, throw прерывает кейс и runCase печатает этот текст, 
// например конфликт слота. 
        await driver.wait(async () => {
          const url = await driver.getCurrentUrl();
          if (url.includes('/bookings') && !url.includes('/bookings/new')) return true;
          const text = (await message.getText()).trim();
          if (text) throw new Error(text);
          return false;
        }, 15000);

// Затем getText() у #bookingsTable должен содержать и 2028-07-01, и Active.
        await driver.wait(until.elementLocated(By.css('#bookingsTable tr')), 10000);
        const tableText = await driver.findElement(By.id('bookingsTable')).getText();
        if (!tableText.includes(DAY) || !tableText.includes('Active')) {
          throw new Error('в списке нет Active на ' + DAY);
        }
      });

      if (!created) {
        failed += 1;
      } else {
// TC-E-04 ищет строку этого дня и нажимает Cancel:
        const cancelled = await runCase('TC-E-04', async () => {
          const rows = await driver.findElements(By.css('#bookingsTable tr'));
          let cancelButton = null;
          for (const row of rows) {
            const text = await row.getText();
            if (text.includes(DAY) && text.includes('Active')) {
// findElement у строки ищет кнопку только внутри найденной этой строки row.
              cancelButton = await row.findElement(By.css('.btn-cancel'));
              break;
            }
          }
		  
          if (!cancelButton) throw new Error('кнопка Cancel для ' + DAY + ' не найдена');

//  Страница вызывает confirm (Это встроенная функция браузера, 
// и её вызывает страница списка броней в тот момент, когда нажата кнопка Cancel) и далее Обработчик на странице запускает cancelBooking, это диалог браузера
		  await cancelButton.click();
// until.alertIsPresent() ждёт, пока окно confirm появится, не дольше 5 секунд.
          await driver.wait(until.alertIsPresent(), 5000);
// switchTo().alert() переводит команды драйвера с страницы на это окно.
// accept() нажимает OK, то есть confirm возвращает true
          await driver.switchTo().alert().accept();
// А Метод dismiss() нажал бы вторую кнопку и отменил бы удаление.

          await driver.wait(async () => {
            const nextRows = await driver.findElements(By.css('#bookingsTable tr'));
            for (const row of nextRows) {
              const text = await row.getText();
              if (text.includes(DAY) && text.includes('Cancelled')) return true;
            }
            return false;
          }, 10000);
        });
        if (!cancelled) failed += 1;
      }
    }
// Закрытие браузера не зависит от результата:
// finally выполняется и после успеха, и после исключения.
  } finally {
// quit закрывает Chrome и сессию драйвера.
    await driver.quit();
  }

  if (failed) {
    console.log('Не пройдено: ' + failed);
    process.exitCode = 1;
  } else {
    console.log('Все TC-E пройдены');
  }
}
// process.exitCode = 1 помечает запуск неуспешным для консоли, но сам процесс не обрывает до печати итога. 
// Последние строки файла — main().catch(...): если браузер не запустился, 
// ошибка попадёт в консоль, а не пропадёт внутри промиса.
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
