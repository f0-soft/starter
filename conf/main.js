'use strict';

module.exports = {
	rabbit: require( 'f0.rabbit' ),
	flexo: require( 'f0.flexo' ),
	view: require( 'f0.view' ),
	controller: require( 'f0.controller' ),

	flexo_path: __dirname + '/../scheme/flexo',
	link_path: __dirname + '/../scheme/link',
	view_path: __dirname + '/../scheme/view',
	template_path: __dirname + '/../view/template',
	template_timeout: 100,
	controller_role_to_company_view: {},

	redis: {
		host: '127.0.0.1',
		port: 6379
	},

	rabbit_hint: {},
	rabbit_hint_score: {},
	rabbit_presum: {}
};
