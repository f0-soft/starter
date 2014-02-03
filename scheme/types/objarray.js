'use strict';

var tArray = require( './array' );

exports.name = 'objarray';
exports.array = true;
exports.subtype = true;

exports.default = tArray.default;
exports.save = tArray.save;
exports.read = tArray.read;
exports.find = function( elem, subtype ) {
	return [false, elem]; //FIXME: произвести проверку свойств вложенных объектов
};
