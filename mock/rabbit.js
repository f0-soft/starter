'use strict';

var argstype = require( 'f0.argstype' );



var INITIALIZED;
var checks = {};

function myErr( text ) {
	return ( new Error( 'f0.rabbit: ' + text ));
}



checks.init = argstype.getChecker( myErr, [
	['config', true, 'o', [
		['port', false, 'n'],
		['host', false, 's']
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
	insert: function() {},
	modify: function() {},
	delete: function() {},
	aggregate: function() {},
	init: init,
	status: function() {}
};
