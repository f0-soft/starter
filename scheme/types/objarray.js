'use strict';

var tArray = require( './array' );

exports.name = 'objarray';
exports.array = true;
exports.subtype = true;

exports.default = function() { return []; };
exports.save = function( elem, subtype, processor ) {
	var keys, subresult, result, obj;

	result = tArray.save( elem );
	if ( result[0] ) { return result; }

	keys = Object.keys( subtype );
	for ( var i = 0; i < result[1].length; i += 1 ) {
		obj = {};
		for ( var j = 0; j < keys.length; j += 1 ) {
			subresult = processor( result[1][i][ keys[j] ], subtype[ keys[j] ].type );

			if ( subresult[0] ) {
				result[0] = subresult[0];
				return result;
			}

			obj[ keys[j] ] = subresult[1];
		}
		result[1][i] = obj;
	}

	return result;
};
exports.read = function( elem, subtype, processor ) {
	var keys, subresult, result, obj;

	result = tArray.read( elem );
	if ( result[0] ) { return result; }

	keys = Object.keys( subtype );
	for ( var i = 0; i < result[1].length; i += 1 ) {
		obj = {};
		for ( var j = 0; j < keys.length; j += 1 ) {
			subresult = processor( result[1][i][ keys[j] ], subtype[ keys[j] ].type );

			if ( subresult[0] ) {
				result[0] = subresult[0];
				return result;
			}

			obj[ keys[j] ] = subresult[1];
		}
		result[1][i] = obj;
	}

	return result;
};
exports.find = function( elem, subtype ) {
	return [false, elem]; //FIXME: произвести проверку свойств вложенных объектов
};
