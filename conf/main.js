'use strict';

module.exports = {
	'rabbit-server': require('f0.rabbit-server'),
	rabbit: require( 'f0.rabbit' ),
	flexo: require( 'f0.flexo' ),
	view: require( 'f0.view' ),
	controller: require( 'f0.controller' ),

	flexo_path: undefined,
	link_path: undefined,
	view_path: undefined,
	template_path: undefined,
	
	template_timeout: 100,
	controller_role_to_company_view: {},

	redis: {
		host: '127.0.0.1',
		port: 6379
	},

	collection_alias: {}
};
