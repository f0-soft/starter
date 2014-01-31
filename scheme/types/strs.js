'use strict';

var tStr = require( './str' );
var tArray = require( './array' );

exports.name = 'strs';
exports.array = true;
exports.subtype = false;

exports.default = tArray.default;
exports.save = function( elem ) {
	var arr = tArray.save( elem );
	if ( arr[0] ) { return [ 'не удалось преобразовать к типу `strs`', arr[1] ]; }
	if ( !arr[1].length ) { return [ false, exports.default() ]; } // default value
	for ( var i = 0; i < arr[1].length; i += 1 ) {
		var el = tStr.save( arr[1][i] );
		if ( el[0] ) { return [ 'элемент `' + i + '` не соответствует типу `strs`', arr[1] ]; }
	}
	return [ false, arr[1] ];
};
exports.read = tArray.read;
exports.find = tStr.read;
