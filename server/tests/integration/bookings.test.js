"use strict"


const request = require('supertest');
const app = require('../../app');

const PASSWORD = "Password123!";

// дополняет число слева нулём до двух символов
function pad(n) {
    return String(n).padStart(2, '0');

}
//formatSqlDate(date) преобразует объект Date в строку формата MySQL: YYYY-MM-DD HH:mm:ss
function formatSqlDate(date) { 
    //setDate / setHours / getTime — методы объекта Date 2 * 60 * 60 * 1000 — два часа в миллисекундах
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}


// futureSlot сдвигает дату на 60 дней и добавляет 
// случайные часы и минуты. Повторный прогон не попадает в бронь прошлого запуска.
function futureSlot() {
    const start = new Date();
    start.setDate(start.getDate() + 60);
    start.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return {
        start_time: formatSqlDate(start),
        end_time: formatSqlDate(end),
    };
}

// login та же, что в тестах безопасности, но возвращает ещё res.body.user. 
// В ответе логина есть id и role. TC-I-08 сравнивает user_id строк с student.user.id, 
// а не с зашитой пятёркой.
async function login(email) {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: PASSWORD });

    if (res.status !== 200) {
        throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
    }

    return {
        cookie: res.headers['set-cookie'],
        user: res.body.user,
    };
}

describe('TC-I booking API and procedures', () => {
    let student
    let slot;

    // beforeAll выполняется один раз до всех test в этом describe. 
    // Внутри логин и один слот на двоих: TC-I-04 создаёт бронь, 
    // TC-I-05 шлёт тот же slot. Если время каждый раз новое, конфликта 
    // не будет и TC-I-05 упадёт.
    beforeAll(async () => {
        student = await login('student@chem.lab.local');
        slot = futureSlot();
    });

    test('TC-I-01: student login returns 200 and cookie', () => {
        expect(student.user.role).toBe('student');
        expect(student.cookie).toBeDefined();
        expect(student.cookie.join(';')).toMatch(/token=/);
    });

    test('TC-I-03: GET /api/equipment with cookie returns an array', async () => {
        const res = await request(app)
            .get('/api/equipment')
            .set('Cookie', student.cookie);

        expect(res.status).toBe(200);
        //Array.isArray(res.body) проверяет, что API отдал массив, а не объект ошибки.
        expect(Array.isArray(res.body)).toBe(true);
        //toBeGreaterThan(0) — каталог не пустой
        expect(res.body.length).toBeGreaterThan(0);

    });
    test('TC-I-04: POST /api/bookings creates an active booking', async () => {
        const res = await request(app)
            .post('/api/bookings')
            .set('Cookie', student.cookie)
            .send({
                equipment_id: 1,
                start_time: slot.start_time,
                end_time: slot.end_time,
            });
        expect(res.status).toBe(201);
        expect(res.body.booking_status).toBe('active');
        expect(res.body.equipment_id).toBe(1);
        expect(res.body.user_id).toBe(student.user.id);
    });
    test('TC-I-05: the same slot conflicts', async () => {
        const res = await request(app)
            .post('/api/bookings')
            .set('Cookie', student.cookie)
            .send({
                equipment_id: 1,
                start_time: slot.start_time,
                end_time: slot.end_time,
            });
        expect(res.status).toBe(400);
        //toMatch(/conflict/i) — в тексте ошибки есть слово conflict, регистр не важен.
        expect(res.body.error).toMatch(/conflict/i); //Флаг i у регулярного выражения это и значит.
    });
    //TC-I-06 и TC-I-07 не вставляют строку: процедура отклоняет запрос раньше INSERT. 
    // Для них отдельный слот не обязателен
    test('TC-I-06: end_time before start_time is rejected', async () => {
        const res = await request(app)
            .post('/api/bookings')
            .set('Cookie', student.cookie)
            .send({
                equipment_id: 1,
                start_time: '2026-11-01 12:00:00',
                end_time: '2026-11-01 10:00:00',
            });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/after start_time/i);
    });
    //TC-I-07 и TC-I-09 он всё равно свой, чтобы не смешивать их с парой 04/05.
    test('TC-I-07: equipment in maintenance cannot be booked', async () => {
        const other = futureSlot();
        const res = await request(app)
            .post('/api/bookings')
            .set('Cookie', student.cookie)
            .send({
                equipment_id: 3,
                start_time: other.start_time,
                end_time: other.end_time,
            });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/not available/i);
    });
    test('TC-I-08: GET /api/bookings/me returns only the student bookings', async () => {
        const res = await request(app)
            .get('/api/bookings/me')
            .set('Cookie', student.cookie);
        expect(res.status).toBe(200);
        //Array.isArray(res.body) проверяет, что API отдал массив, а не объект ошибки.
        expect(Array.isArray(res.body)).toBe(true);
        //every(...) — каждая бронь принадлежит студенту
        expect(res.body.every((row) => row.user_id === student.user.id)).toBe(true);
    });
    test('TC-I-09: student cannot book for another user', async () => {
        const other = futureSlot();
        const res = await request(app)
            .post('/api/bookings')
            .set('Cookie', student.cookie)
            .send({
                equipment_id: 1,
                user_id: 4,
                start_time: other.start_time,
                end_time: other.end_time,
            });
        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/only book for self/i);
    });
});




