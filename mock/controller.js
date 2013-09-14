'use strict';

var argstype = require( 'f0.argstype' );



var INITIALIZED;
var checks = {};

function myErr( text ) {
	return ( new Error( 'f0.controller: ' + text ));
}



checks.init = argstype.getChecker( myErr, [
	['config', true, 'o', [
		['redisConfig', false, 'o', [
			['port', true, 'n'],
			['host', true, 's'],
			['max_attempts', false, 'n']
		]],
		['view', true, 'o', [
			['getTemplate', true, 'f'],
			['find', true, 'f'],
			['insert', true, 'f'],
			['modify', true, 'f'],
			['delete', true, 'f']
		]],
		['viewConfig', true, 'o', [
			'*', false, 'o', [ // any view
				'*', false, 'o', [ // any vid
					['flexo', true, 'a', [
						['flexoSchemeName', true, 's'],
						['fieldName', true, 's']
					]],
					['type', true, 's']
				]
			]
		]],
		['flexoSchemes', true, 'o', [
			'*', false, 'o', [
				['read', true, 'a'],
				['modify', true, 'a'],
				['readForAdminPanel', true, 'a', [
					'*', false, 'a', [
						['fieldName', true, 's'],
						['title', true, 's'],
						['description', true, 's']
					]
				]],
				['modifyForAdminPanel', true, 'a', [
					'*', false, 'a', [
						['fieldName', true, 's'],
						['title', true, 's'],
						['description', true, 's']
					]
				]]
			]
		]],
		['configRoleToCompanyView', true, 'o', [
			'*', false, 's'
		]]
	]],
	['callback', true, 'f']
] );
function init( config, callback ) {
	var errType = checks.init( arguments );

	if ( errType ) {
		return process.nextTick( callback.bind( null, errType ) );
	}

	if ( INITIALIZED ) { callback( myErr( 'Controller reinitialization prohibited' ) ); }

	INITIALIZED = true;

	return process.nextTick( callback.bind( null, null, true ) );
}

module.exports = {
	init: init,
	create: function() {},
	find: function() {},
	delete: function() {},
	modify: function() {},
	getTemplate: function() {},
	queryToView: function() {},
	findErrorLogging: function() {},
	deleteErrorLogging: function() {}
};
