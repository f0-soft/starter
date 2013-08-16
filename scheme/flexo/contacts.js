// схема контактных лиц заказчиков

module.exports = {
    name: 'contacts',

    root: {
        fio: { type: 'string' }, // ФИО
        position: { type: 'string' }, // должность
        phone: {type: 'string'}, // телефон
        fax: {type: 'string' },  // факс
        email:  {type: 'string' }, // email
        note: {type: 'string' }, // примечание
        c_id: {type: 'string' }
    },

    join: {
        customers: { // название компании
            fields: [ 'name', 'm_id'],
            depend: [ 'root', 'c_id' ]
        }
    }
}