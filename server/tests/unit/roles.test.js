'use strict';

// Скрипт npm run test:unit 

//Jest сам подставляет функции describe, test и expect. Их не нужно импортировать через require.

// describe('TC-U roles.js', () => { ... }) группирует восемь проверок под одним заголовком 
// в отчёте. Стрелочная функция () => {} — тело группы. Внутри неё Jest выполняет каждый 
// test по очереди.

// test('название', () => { ... }) — один тест-кейс. Первый аргумент — строка, 
// которую вы увидите в терминале. Второй — функция с проверками. Синоним test — it; 
// для отчёта удобнее test, чтобы название совпадало с ID из плана.

// expect(значение) оборачивает фактический результат. Дальше цепочка матчеров говорит, 
// каким он должен быть. Если матчер не совпал, Jest помечает тест как failed и 
// печатает «ожидали / получили».

// require('../../config/roles') загружает модуль один раз и возвращает объект 
// module.exports из roles.js. Фигурные скобки слева — это деструктуризация: 
// из объекта берутся только нужные константы. Можно было написать 
// const roles = require(...) и дальше roles.ROLES, смысл тот же.

// Матчеры:
// toHaveLength(6) в массиве ровно 6 элементов

// toEqual([...]) те же значения и в том же порядке

// toBe('student') строгое равенство, как ===

// toContain('student') строка есть в массиве

// not.toContain('technician') строки в массиве нет

// expect.arrayContaining([...]) оба кода есть, порядок не важен

const {
  ROLES,
  CAN_MANAGE_BOOKINGS,
  CAN_UPDATE_EQUIPMENT_STATUS,
  CAN_CREATE_ORGANIZATIONS,
  CAN_MANAGE_EQUIPMENT,
  CAN_ACCESS_ADMIN_UI,
  DEFAULT_REGISTER_ROLE,
} = require('../../config/roles');


describe('TC-U roles.js', () => {
  test('TC-U-01: in ROLES exactly 6 codes', () => {
    const codes = Object.values(ROLES);
    expect(codes).toHaveLength(6);
    expect(codes).toEqual([
      'system_admin',
      'lab_admin',
      'equipment_manager',
      'researcher',
      'student',
      'technician',
    ]);
  });

  test('TC-U-02: registration role by default is student', () => {
    expect(DEFAULT_REGISTER_ROLE).toBe('student');
    expect(DEFAULT_REGISTER_ROLE).toBe(ROLES.STUDENT);
  });

  test('TC-U-03: student can create bookings', () => {
    expect(CAN_MANAGE_BOOKINGS).toContain('student');
  });

  test('TC-U-04: technician cannot create bookings', () => {
    expect(CAN_MANAGE_BOOKINGS).not.toContain('technician');
  });

  test('TC-U-05: technician can update equipment status', () => {
    expect(CAN_UPDATE_EQUIPMENT_STATUS).toContain('technician');
  });

  test('TC-U-06: only system_admin can create organizations', () => {
    expect(CAN_CREATE_ORGANIZATIONS).toEqual(['system_admin']);
  });

  test('TC-U-07: equipment_manager can manage equipment', () => {
    expect(CAN_MANAGE_EQUIPMENT).toContain('equipment_manager');
  });

  test('TC-U-08: Admin UI is available to system_admin and lab_admin', () => {
    expect(CAN_ACCESS_ADMIN_UI).toEqual(
      expect.arrayContaining(['system_admin', 'lab_admin'])
    );
    expect(CAN_ACCESS_ADMIN_UI).toHaveLength(2);
  });
});
