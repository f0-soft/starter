'use strict';



var mock;
mock = require( '../mock' );

var __ = require( 'underscore' );


var starter = require( '../' );



// clone default config
var config = __.extend( {}, starter.config );

// use mock modules if required
if ( mock ) { config = __.extend( config, mock ); }

// user config
config = __.extend( config, {
	// user config params
} );



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
