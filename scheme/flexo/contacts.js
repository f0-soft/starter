'use strict';

// схема контактных лиц заказчиков

module.exports = {
	name: 'contacts',

	root: {
		fio: { type: 'str' }, // ФИО
		position: { type: 'str' }, // должность
		phone: {type: 'str'}, // телефон
		fax: {type: 'str', weight: true },  // факс
		email: {type: 'str' }, // email
		note: {type: 'str' }, // примечание
		c_id: {type: 'id', from: 'customers', includeWeight: ['customers'] }
	},

	join: {
		customers: { // название компании
			fields: [ 'name', 'm_id'],
			depend: [ 'root', 'c_id' ]
		}
	}
};
