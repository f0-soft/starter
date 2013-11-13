'use strict';

// схема заказчик

module.exports = {
	name: 'customers',

	root: {
		name: { type: 'str', weight: true },
		m_id: { type: 'str' }
	}
};
