'use strict';

var argstype = require( 'f0.argstype' );
var next = require( 'nexttick' );



var INITIALIZED;
var checks = {};

function myErr( text ) {
	return ( new Error( 'f0.starter.mock.rabbit: ' + text ));
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
		return next( callback, errType );
	}

	if ( INITIALIZED ) {
		return next( callback, myErr( 'Rabbit reinitialization prohibited' ) );
	}

	INITIALIZED = true;

	return next( callback, null, true );
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
