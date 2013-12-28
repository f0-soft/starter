'use strict';

var tStr = require( './str' );

exports.name = 'phone';
exports.array = false;
exports.subtype = false;

exports.default = function() { return ''; };
exports.save = function( elem ) {
	var str = tStr.save( elem );
	if ( str[0] ) { return [ 'не удалось преобразовать к типу `phone`', elem ]; }
	if ( !str[1].length ) { return [ false, exports.default() ]; } // default value
	var regIn = /^\(\d{3}\)\d{3}\-\d{2}\-\d{2}$/;
	var regOut = /\d/g;
	return [ !regIn.test( str[1] ), '7' + (str[1].match( regOut ) || []).join( '' ) ];
};
exports.read = function( elem ) {
	if ( !elem.length ) { return [false, elem]; }

	var regOut = /.(...)(...)(..)(..)/;
	if ( !regOut.test( elem ) ) { return [false, elem]; }

	var res = elem.match( regOut );
	return [
		false,
		'(' + res[1] + ')' + res[2] + '-' + res[3] + '-' + res[4]
	];
};
exports.find = exports.save;
