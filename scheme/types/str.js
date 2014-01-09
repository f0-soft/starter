'use strict';

var reopcode = require( './.lib.re-opcode' );
var sanitizer = require( './.lib.sanitizer' );

exports.name = 'str';
exports.array = false;
exports.subtype = false;

exports.default = function() { return ''; };
exports.save = function( elem ) {
	if ( elem === undefined || elem === null ) { return [ true, exports.default() ]; } // default value
	elem = '' + elem;
	elem = sanitizer.escape( elem );
	elem = elem.trim();
	return [ false, elem];
};
exports.read = undefined;
exports.find = function( query ) {
	var res = exports.save( query );
	if ( res[0] ) { return [ true, query ]; }
	res = reopcode.split( res[1] );
	var cmd = res[0];
	var str = exports.save( res[1] );
	if ( str[0] ) { return 'ошибка в параметре запроса'; }
	str = str[1];

	if ( cmd['^'] && cmd['$'] && !cmd['i'] ) {
		return [ false, str ];
	} else {
		return [ false, {
			$regex: (cmd['^'] ? '^' : '') + quoteRegExp( str ) + (cmd['$'] ? '$' : ''),
			$options: (cmd['i'] ? 'i' : '')
		} ];
	}
};

function quoteRegExp( str ) {
	return str.replace( /([.?*+^$[\]\\(){}|-])/g, "\\$1" );
}
