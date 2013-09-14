'use strict';

var argstype = require( 'f0.argstype' );



var INITIALIZED;
var container = {
	getTemplate: function() {},
	find: function() {},
	insert: function() {},
	modify: function() {},
	delete: function() {}
};
var checks = {};

function myErr( text ) {
	return (new Error( 'f0.view: ' + text ));
}



checks.init = argstype.getChecker( myErr, [
	['options', true, 'o', [
		['provider', true, 'o', [
			['find', true, 'f'],
			['insert', true, 'f'],
			['modify', true, 'f'],
			['delete', true, 'f']
		]],
		['views', true, 'o', [
			'*', false, 'o', [
				['view', true, 'o', [
					['name', true, 's'],
					['template', false, 's'],
					['config', true, 'o'],
					['root', false, 's'],
					['join', false, 'o', [
						'*', false, 'o'
					]]
				]],
				['vids', true, 'o', [
					'*', false, 'a', [
						['flexo', true, 's'], // название схемы flexo
						['property', true, 's'], // название поля, к которому осуществляется доступ
						['field', false, 's'], // название поля, по которому осуществляется связь
						['path', false, 'a', [ // путь или пустой массив
							'*', false, 'a', [
								['scheme', true, 's'],
								['field', true, 's']
							]
						]]
					]
				]]
			]
		]],
		['links', true, 'o', [
			'*', false, 'a', 'a'
		]],
		['templatePath', true, 's'],
		['templateTimeout', false, 'n']
	]],
	['callback', true, 'f']
] );
function init( options, callback ) {
	var errType = checks.init( arguments );

	if ( errType ) {
		return process.nextTick( callback.bind( null, errType ) );
	}

	if ( INITIALIZED ) {
		return process.nextTick( callback.bind( null, myErr( 'double initialization' ) ) );
	}

	INITIALIZED = true;
	return process.nextTick( callback.bind( null, null, container ) );
}

module.exports = {
	init: init,
	checks: checks
};