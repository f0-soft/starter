'use strict';

var argstype = require( 'f0.argstype' );



var INITIALIZED;
var checks = {};

function myErr( text ) {
	return ( new Error( 'f0.rabbit: ' + text ));
}



checks.init = argstype.getChecker( myErr, [
	['config', true, 'o', [
		['mongo', false, 'o', [
			['host', false, 's'],
			['port', false, 'n'],
			['options', false, 'o'],
			['dbname', false, 's']
		]],
		['redis', false, 'o', [
			['host', false, 's'],
			['port', false, 'n'],
			['options', false, 'o']
		]],
		['gPath', false, 'o', [
			'*', false, 'a', 'a'
		]],
		['gFieldDepPath', false, 'o', [
			'*', false, 'o', [
				'*', false, 'a'
			]
		]],
		['gHint', true, 'o', [
			'*', false, 'a'
		]],
		['gHintScore', true, 'o', [
			'*', false, 'a'
		]]
	]],
	['callback', true, 'f']
] );
function init( config, callback ) {
	var errType = checks.init( arguments );

	if ( errType ) {
		return process.nextTick( callback.bind( null, errType ) );
	}

	if ( INITIALIZED ) { callback( myErr( 'Rabbit reinitialization prohibited' ) ); }

	INITIALIZED = true;

	return process.nextTick( callback.bind( null, null, true ) );
}

module.exports = {
	find: function() {},
	aggregate: function() {},
	delete: function() {},
	modify: function() {},
	insert: function() {},
	init: init,
	status: function() {},
	createIndex: function() {}
};
