const { By, until } = require('selenium-webdriver');
const login = require('./login');

// run — основной сценарий проверки.
// Он выполняет вход с неправильным паролем, проверяет появление ошибки и убеждается,
// что пользователь остался на странице логина, а не был перенаправлен в другую часть приложения.
async function run(driver, ctx) {
    // Пытаемся войти под корректным email, но с неправильным паролем.
    // Это имитирует сценарий неверных учетных данных пользователя.
    await login(driver, ctx.email, 'Wrongpassword');

    // Ищем контейнер/элемент с текстом сообщения об ошибке в форме входа.
    const message = await driver.findElement(By.id('message'));
    // Ожидаем, пока текст сообщения станет равен 'Invalid password'.
    // Это подтверждает, что сервер или клиент корректно обработал ошибку авторизации.
    await driver.wait(until.elementTextIs(message, 'Invalid password'), 10000);

    // Проверяем текущий URL страницы, чтобы убедиться, что пользователь не покинул экран логина.
    const url = await driver.getCurrentUrl();
    // Если URL больше не содержит страницы логина, сценарий считается неуспешным.
    if (!url.includes('/auth/login')) {
        throw new Error('The page has gone from login: ' + url);
    }
}

// Экспортируем сценарий теста.
// id — уникальный идентификатор проверки; needs — зависимости от других сценариев;
// run — функция, которую runner вызывает для выполнения этого теста.
module.exports = {
    id: 'TC-E-03',
    needs: [],
    run,
};