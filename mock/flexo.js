'use strict';

var argstype = require( 'f0.argstype' );



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
	return ( new Error( 'f0.flexo: ' + text ));
}



var TYPES = {
	str: true,
	words: true,
	int: true,
	float: true,
	bool: true,
	array: true,
	id: true,
	ids: true,
	idpath: true,
	numeric: true,
	phone: true
};
var ARRAYS = {
	words: true,
	array: true,
	ids: true,
	idpath: true
};



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
							['type', true, 's'],
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
							['of', false, 's'],
							['from', false, 's'],
							['inline', false, 's']
						]
					]]
				]]
			]
		]]
	]],
	['callback', true, 'f']
] );
function init( options, callback ) {
	var errType = checks.init( arguments );

	if ( errType ) {
		return process.nextTick( callback.bind( null, errType ) );
	}

	if ( INITIALIZED ) { callback( myErr( 'Flexo reinitialization prohibited' ) ); }

	INITIALIZED = true;

	return process.nextTick( callback.bind( null, null, container ) );
}

module.exports = {
	init: init,
	checks: checks,
	types: TYPES,
	arrays: ARRAYS
};
