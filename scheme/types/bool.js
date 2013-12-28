'use strict';

var tStr = require( './str' );

exports.name = 'bool';
exports.array = false;
exports.subtype = false;

exports.default = function() { return false; };
exports.save = function( elem ) {
	var str = tStr.save( elem );
	if ( str[0] ) { return [ 'не удалось преобразовать к типу `bool`', str[1] ]; }
	if ( !str[1].length ) { return [ false, exports.default() ]; } // default value

	var falses = /^(|0|false)$/;
	if ( falses.test( str[1] ) ) { return [ false, false ]; }

	var trues = /^(.*|1|true)$/;
	if ( trues.test( str[1] ) ) { return [ false, true ]; }

	return [ 'не удалось преобразовать к типу `bool`', str[1] ];
};
exports.read = undefined;
exports.find = exports.save;
