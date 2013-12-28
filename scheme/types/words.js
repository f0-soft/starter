'use strict';

var tStr = require( './str' );
var reopcode = require( './.lib.re-opcode' );
var nonWordRegexp = /[^a-zA-Zа-яА-Я0-9]/gi;

exports.name = 'words';
exports.array = false;
exports.subtype = false;

exports.default = function() { return ''; };
exports.save = tStr.save;
exports.read = undefined;
exports.find = function( query ) {
	var wrds = exports.save( query );
	if ( wrds[0] ) { return [ 'ошибка в параметре запроса', query ]; }

	// если управляющий символ - регулярка
	if ( reopcode.hasOpcode( wrds[1] ) ) {
		wrds = wrds[1];
		return tStr.find( wrds );
	}

	// к нижнему регистру
	wrds = wrds[1].toLowerCase();

	// заменить пунктуацию на пробелы
	wrds = wrds.replace( nonWordRegexp, ' ' );

	// разбить на слова по пробелам
	wrds = wrds.split( ' ' );

	// массив регулярок /^text/ через $in
	var out = [];
	for ( var i = 0; i < wrds.length; i += 1 ) {
		if ( wrds[i].length ) {
			out.push( {
				$regex: '^' + wrds[i],
				$options: ''
			} );
		}
	}

	if ( !out.length ) { return [ 'запрос должен включать в себя буквенно-цифровые символы', query ]; }

	return [ false, { $in: out } ];
};
