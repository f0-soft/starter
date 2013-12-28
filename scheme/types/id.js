'use strict';

var tStr = require( './str' );
var tArray = require( './array' );
var t_Id = require( './_id' );

exports.name = 'id';
exports.array = true;
exports.subtype = false;

exports.default = function() { return []; };
exports.save = function( elem ) {
	var arr = tArray.save( elem );
	if ( arr[0] ) { return [ 'не удалось преобразовать к типу `id`', arr[1] ]; }
	if ( !arr[1].length ) { return [ false, exports.default() ]; } // default value
	for ( var i = 0; i < arr[1].length; i += 1 ) {
		var el = t_Id.save( arr[1][i] );
		if ( el[0] ) { return [ 'элемент `' + i + '` не соответствует типу `id`', arr[1] ]; }
	}
	return [ false, arr[1] ];
};
exports.read = tArray.read;
exports.find = function( query ) {
	var ids = exports.save( [query] );
	if ( ids[0] ) { return ['ошибка в параметре запроса', query]; }
	return [ false, ids[1][0] ];
};
