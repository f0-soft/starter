'use strict';

var tStr = require( './str' );

exports.name = 'int';
exports.array = false;
exports.subtype = false;

exports.default = function() { return 0; };
exports.save = function( elem ) {
	var str = tStr.save( elem );
	if ( str[0] ) { return ['не удалось преобразовать к типу `int`', str[1]]; }
	if ( !str[1].length ) { return [ false, exports.default() ]; } // default value
	var int = parseInt( str[1] );
	if ( str[1] !== ('' + int) ) { return [ 'значение не соответствует типу `int`', str[1] ]; }
	return [ false, int ];
};
exports.read = undefined;
exports.find = exports.save;
