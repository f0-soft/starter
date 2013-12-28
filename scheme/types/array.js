'use strict';

var tStr = require( './str' );

exports.name = 'array';
exports.array = true;
exports.subtype = false;

exports.default = function() { return []; };
exports.save = function( elem ) {
	if ( Array.isArray( elem ) ) { return [ false, elem ]; }
	var str = tStr.save( elem );
	if ( str[0] ) { return str; }
	if ( !str[1].length ) { return [ false, exports.default() ]; } // default value
	return [ false, [ str[1] ] ];
};
exports.read = function( elem ) {
	if ( !elem ) { return [ false, exports.default() ]; }
	return [ false, elem ];
};
exports.find = function( query ) {
	var arr = exports.save( [ query ] );
	if ( arr[0] ) { return [ 'ошибка в параметре запроса', query ]; }
	return [ false, arr[1][0] ];
};
