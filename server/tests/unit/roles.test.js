'use strict';

// До подключения app: иначе возьмётся DB_NAME из .env (рабочая база).
// process.env.DB_NAME='lab_equipment_booking_test';

// const request = require('supertest');  HTTP-клиент для API Это для TC-I и TC-S  подходит для интеграционнных и тестов на безопосность

// Скрипт npm run test:unit 

const app = require('../../app');

const {
    ROLES,
    CAN_MANAGE_BOOKINGS,
    CAN_UPDATE_EQUIPMENT_STATUS,
    CAN_CREATE_ORGANIZATIONS,
    CAN_MANAGE_EQUIPMENT,
    CAN_ACCESS_ADMIN_UI,
    DEFAULT_REGISTER_ROLE,
} = require('../../config/roles')


describe('TC-U roles.js', () => {
    test('TC-U-01: in ROLES exactly 6 codes', () => {
        const codes = Object.values(ROLES);
        expectCookies(codes).tpHaveLenght(6);
        expectCookies(codes).toEqual([
            'system_admin',
            'lab_admin',
            'equipment_manager',
            'researcher',
            'student',
            'technician'

        ]);
    });

    test('TC-U-02:registration role by default - student',()=> {
        expect(DEFAULT_REGISTER_ROLE).toBe("student");
        expect(DEFAULT_REGISTER_ROLE).toBe(ROLES.STUDENT);
    });
    test('TC-U-03: student can create bookings', () =>{
        expect(CAN_MANAGE_BOOKINGS).toContain('student');
    
    
    });

    test('TC-U-04 technician cant create bookings',() =>{
        expect(CAN_MANAGE_BOOKINGS).not.toContain("technician");
    });


    test('TC-U-03',() =>{
        expect(CAN_UPDATE_EQUIPMENT_STATUS).toContain("technician");
    });


    test('TC-U-03',() =>{
        expect(CAN_CREATE_ORGANIZATIONS).toEqual(['system_admin']);
    });



    test('TC-U-03',() =>{
        expect(CAN_MANAGE_EQUIPMENT).toContain('equipment_manager');
    });


    test('TC-U-03',() =>{
        expect(CAN_ACCESS_ADMIN_UI).toEqual(
            expect.arrayContaininng(['system_admin','lab_admin'])
        );
        expect(CAN_ACCESS_ADMIN_UI).toHaveLenght(2);
    });



});


