'use strict';

var tStr = require( './str' );

exports.name = '_id';
exports.array = false;
exports.subtype = false;

exports.default = function() { return undefined; };
exports.save = function( elem ) {
	var str = tStr.save( elem );
	if ( str[0] ) { return [ 'не удалось преобразовать к типу `_id`', str[1] ]; }
	var reg = /^\w{2}[\da-z]+$/;
	return [ !reg.test( str[1] ), str[1] ];
};
exports.read = undefined;
exports.find = exports.save;
