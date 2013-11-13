'use strict';



var mock;
mock = true;



var __ = require( 'underscore' );
var starter = require( '../' );



var config = __.extend(
	{},
	starter.config,
	( mock ? starter.mock : {} ), // подключение имитации модулей вместо настоящих (подключаемых по умолчанию)
	{ // конфиг пользвателя
		flexo_path: __dirname + '/../scheme/flexo',
		link_path: __dirname + '/../scheme/link',
		view_path: __dirname + '/../scheme/view',
		template_path: __dirname + '/../view/template'
	}
);



exports.testInit = function( t ) {
	t.expect( 8 );
	starter.init( config, function( err, module, all ) {
		t.ifError( err );

		t.ok( module );
		t.ok( all );
		t.doesNotThrow( function() {
			t.ok( all.rabbit );
			t.ok( all.flexo );
			t.ok( all.view );
			t.ok( all.controller );
		} );

		t.done();
	} );
};



/**
 * Available test methods
 */
var t = {
	expect: function( number ) { return number; },
	ok: function( value, message ) { return value;},
	deepEqual: function( actual, expected, message ) { return [actual, expected];},
	notDeepEqual: function( actual, expected, message ) { return [actual, expected];},
	strictEqual: function( actual, expected, message ) { return [actual, expected];},
	notStrictEqual: function( actual, expected, message ) { return [actual, expected];},
	throws: function( block, error, message ) { return block;},
	doesNotThrow: function( block, error, message ) { return block;},
	ifError: function( value ) { return value;},
	done: function() { return true;}
};
