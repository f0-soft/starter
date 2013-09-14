'use strict';



var mock;
mock = require( '../mock' );



var starter = require( '../' );
var config = require( '../conf/main' );



config.rabbit = mock ? mock.rabbit : require( 'f0.rabbit' );
config.flexo = mock ? mock.flexo : require( 'f0.flexo' );
config.view = mock ? mock.view : require( 'f0.view' );
config.controller = mock ? mock.controller : require( 'f0.controller' );



exports.testInit = function( t ) {
	t.expect( 2 );
	starter.init( config, function( err, module ) {
		t.ifError( err );

		t.ok( module );

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
