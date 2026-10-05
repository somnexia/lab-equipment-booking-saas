const { By, until } = require("selenium-webdriver");
// By задает способы поиска элементов страницы, а until — условия ожидания,
// которые используются WebDriver для синхронизации с состоянием страницы.
const login = require('./login');

/**
 * Выполняет вход в систему, ожидает открытие панели управления
 * и проверяет, что заголовок страницы содержит текст "Equipment catalog".
 *
 * Используется как E2E сценарий для проверки доступа к каталогу оборудования.
 *
 * @param {import('selenium-webdriver').WebDriver} driver - экземпляр Selenium WebDriver.
 * @param {{ email: string, password: string }} ctx - данные пользователя для авторизации.
 * @returns {Promise<void>}
 */
async function run(driver, ctx) {
    // run — асинхронная функция тестового сценария; получает браузерный
    // WebDriver и учетные данные, затем выполняет проверки в браузере.

    // Выполняем логин пользователя с помощью отдельного модуля login.
    await login(driver, ctx.email, ctx.password);

    // Ждем, пока URL страницы будет содержать 'dashboard',
    // что означает успешный переход после авторизации. driver.wait повторяет
    // проверку условия until.urlContains до успеха или истечения таймаута.
    await driver.wait(until.urlContains('dashboard'), 15000);

    // driver.findElement ищет элемент на странице, а By.css задает поиск
    // по CSS-селектору h1.page-title.
    const title = await driver.findElement(By.css('h1.page-title'));

    // Проверяем, что текст заголовка ровно соответствует ожидаемому значению.
    // until.elementTextIs формирует условие точного совпадения текста;
    // driver.wait ожидает его выполнения не дольше 5 секунд.
    await driver.wait(until.elementTextIs(title, 'Equipment catalog'), 5000);
}

module.exports = {
    // id — уникальный идентификатор, по которому сценарий известен тестовому набору.
    id: 'TC-E-01',
    // needs — список сценариев, от которых зависит запуск этого сценария.
    needs: [],
    // run — экспортируемая функция выполнения сценария.
    run,
};
