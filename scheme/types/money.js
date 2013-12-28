'use strict';

var tFloat = require( './float' );
var tInt = require( './int' );

exports.name = 'money';
exports.array = false;
exports.subtype = false;

exports.default = function() { return 0; };
exports.save = function( elem ) {
	var flt = tFloat.save( elem );
	if ( flt[0] ) { return [ 'не удалось преобразовать к типу `money`', elem ]; }
	var int = tInt.save( flt[1] * 100 );
	if ( int[0] ) { return [ 'не удалось преобразовать к типу `money`', elem ]; }
	return [ false, int[1] ];
};
exports.read = function( elem ) {
	return [ false, elem / 100 ];
};
exports.find = exports.save;
