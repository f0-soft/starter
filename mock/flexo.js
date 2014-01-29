'use strict';

var argstype = require( 'f0.argstype' );
var next = require( 'nexttick' );



var INITIALIZED;
var container = {
	find: function() {},
	aggregate: function() {},
	insert: function() {},
	modify: function() {},
	delete: function() {}
};
var checks = {};

function myErr( text ) {
	return ( new Error( 'f0.starter.mock.flexo: ' + text ));
}



checks.init = argstype.getChecker( myErr, [
	['options', true, 'o', [
		['storage', true, 'o', [ // функции работы с хранилищем
			['find', true, 'f'],
			['aggregate', true, 'f'],
			['insert', true, 'f'],
			['modify', true, 'f'],
			['delete', true, 'f']
		]],
		['schemes', true, 'o', [ // доступные схемы со справочниками
			'*', false, 'o', [
				['scheme', true, 'o', [ // валидация схем
					['name', true, 's'],
					['root', true, 'o', [
						'*', true, 'o', [
							['type', false, 's'],
							['subtype', false, 'o', [
								'*', true, 'o', [
									['type', true, 's']
								]
							]],
							['from', false, 's'],
							['link', false, 's']
						]
					]],
					['join', false, 'o', [
						'*', false, 'o', [
							['fields', true, 'a', 's'],
							['depend', true, 'a', [
								['scheme', true, 's'],
								['root-field', true, 's']
							]]
						]
					]]
				]],
				['dict', true, 'o', [ // валидация справочников
					['all', true, 'a', 's'],
					['mutable', true, 'a', 's'],
					['joinProperties', true, 'a', [
						'*', false, 's'
					]],
					['joins', true, 'a', [
						'*', false, 's'
					]],
					['types', true, 'o', [
						'*', true, 'o', [
							['type', true, 's'],
							['from', false, 's'],
							['link', false, 's']
						]
					]]
				]]
			]
		]],
		['types', true, 'o', [
			'*', true, 'o', [
				['array', false, 'b'],
				['subtype', false, 'b'],
				['default', true, 'f'],
				['save', false, 'f'],
				['read', false, 'f'],
				['find', false, 'f']
			]
		]],
		['hook_timeout', false, 'n'],
		['server', true, 'o', [
			['port', true, 'n']
		]]
	]],
	['callback', true, 'f']
] );
function init( options, callback ) {
	var errType = checks.init( arguments );

	if ( errType ) {
		return next( callback, errType );
	}

	if ( INITIALIZED ) {
		return next( callback, myErr( 'Flexo reinitialization prohibited' ) );
	}

	INITIALIZED = true;

	return next( callback, null, container );
}

module.exports = {
	init: init,
	checks: checks
};
