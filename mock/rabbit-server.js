'use strict';

var argstype = require( 'f0.argstype' );
var next = require( 'nexttick' );



var INITIALIZED;
var checks = {};

function myErr( text ) {
	return ( new Error( 'f0.starter.mock.rabbit-server: ' + text ));
}



checks.init = argstype.getChecker( myErr, [
	['config', true, 'o', [
		['port', false, 'n'], // порт сервера rabbit
		['host', false, 's'], // хост сервера rabbit
		['mongo', false, 'o', [ // конфиг mongo
			['host', false, 's'],
			['port', false, 'n'],
			['options', false, 'o'],
			['dbname', false, 's']
		]],
		['redis', false, 'o', [ // конфиг редис
			['host', false, 's'],
			['port', false, 'n'],
			['options', false, 'o']
		]],
		['gPrefixCol', true, 'o', [ // справочник префиксов путей
			['p2c', true, 'o', [
				'*', false, 's'
			]],
			['c2p', true, 'o', [
				'*', false, 's'
			]]
		]],
		['gPath', false, 'o', [ // справочник всех путей
			'*', false, 'a', [
				'*', true, 'a', [
					['collection', true, 's'],
					['field', true, 's']
				]
			]
		]],
		['gFieldDepPath', false, 'o', [ // справочник связи названия поля и пути
			'*', false, 'o', [
				'*', false, 'a'
			]
		]],
		['gBackRef', true, 'o', [ // справочник колекций связанных с документом (для проверки перед удалением)
			'*', false, 'a', [
				'*', true, 'a', [
					['collection', true, 's'],
					['field', true, 's']
				]
			]
		]],
		['gScore', true, 'o', [ // справочник колекций где есть вес
			'*', false, 'o', [ // схема
				'*', true, 'n'
			]
		]],
		['gScoreJoin', true, 'o', [ // справочник колекций в которых должен быть вес из внешней коллекции
			'*', false, 'o', [ // схема
				'*', true, 'o', [ // поле
					'*', true, 'n' // внешняя схема
				]
			]
		]],
		['gWordFields' , true, 'o', [ // справочник полей разбиваемых на слова для поиска
			'*', false, 'o', [ // схема
				'*', true, 'n' // поле
			]
		]],
		['gArrayFields', true, 'o', [ // справочник полей, которые являются массивами
			'*', false, 'o', [ // схема
				'*', true, 'n' // поле
			]
		]]
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


checks.open = argstype.getChecker( myErr, [
	['port', true, 'n'],
	['host', true, 's'],
	['callback', true, 'f']
] );
function open( port, host, callback ) {
	var errType = checks.init( arguments );

	if ( errType ) {
		return next( callback, errType );
	}

	if ( !INITIALIZED ) {
		return next( callback, myErr( 'Rabbit еще не инициализирован' ) );
	}

	return next( callback, null, true );
}



checks.close = argstype.getChecker( myErr, [
	['callback', true, 'f']
] );
function close( callback ) {
	var errType = checks.close( arguments );

	if ( errType ) {
		return next( callback, errType );
	}

	return next( callback, null );
}

module.exports = {
	init: init,
	open: open,
	close: close
};
