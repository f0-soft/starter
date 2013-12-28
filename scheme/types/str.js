'use strict';

var reopcode = require( './.lib.re-opcode' );

exports.name = 'str';
exports.array = false;
exports.subtype = false;

exports.default = function() { return ''; };
exports.save = function( elem ) {
	if ( elem === undefined || elem === null ) { return [ true, exports.default() ]; } // default value
	return [ false, ( '' + elem ).trim() ];
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
