'use strict';

var next = require( 'nexttick' );
var argstype = require( 'f0.argstype' );



function myErr( text ) {
	return ( new Error( 'f0.starter.mock.flexo-client: ' + text ));
}



var CLIENT;
var container = {
	find: function() {},
	insert: function() {},
	modify: function() {},
	delete: function() {},
	aggregate: function() {},
	groupCount: function() {}
};
var checks = {};



checks.init = argstype.getChecker( myErr, [
	['options', true, 'o', [
		['host', true, 's'],
		['port', true, 'n'],
		['ping', false, 'n'],
		['timeout', false, 'n'],
		['reconnect', false, 'n']
	]],
	['callback', true, 'f']
] );
exports.init = function( options, cb ) {
	var errType = checks.init( arguments );

	if ( errType ) {
		return next( cb, errType );
	}

	// singleton
	if ( CLIENT ) {
		return next( cb, null, CLIENT );
	}

	CLIENT = {};

	return next( cb, null, container );
};



exports.checks = checks;
