'use strict';

var tStr = require('./str');

exports.name = 'numeric';
exports.array = false;
exports.subtype = false;

exports.default = function() { return ''; };
exports.save = function( elem ) {
	var str = tStr.save( elem );
	if ( str[0] ) { return [ 'не удалось преобразовать к типу `numeric`', elem ]; }
	if ( !str[1].length ) { return [ false, exports.default() ]; } // default value
	var reg = /^\d+$/;
	return [ !reg.test( str[1] ), str[1] ];
};
exports.read = undefined;
exports.find = exports.save;
