'use strict';

var tStr = require( './str' );

exports.name = 'float';
exports.array = false;
exports.subtype = false;

exports.default = function() { return 0; };
exports.save = function( elem ) {
	var str = tStr.save( elem );
	if ( str[0] ) { return [ 'не удалось преобразовать к типу `float`', str[1] ]; }
	if ( !str[1].length ) { return [ false, exports.default() ]; } // default value

	// замена запятых на точки
	var newstr = str[1].replace( /\,/g, '.' );

	var flt = parseFloat( newstr );
	if ( newstr !== ('' + flt) ) { return [ 'значение не соответствует типу `float`', newstr ]; }
	return [ false, flt ];
};
exports.read = undefined;
exports.find = exports.save;
