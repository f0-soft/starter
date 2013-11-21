'use strict';



var mock;
mock = true;



var __ = require( 'underscore' );
var starter = require( '../' );



var config = __.extend(
	{},
	starter.config,
	( mock ? starter.mock : {} ), // подключение имитации модулей вместо настоящих (подключаемых по умолчанию)
	{ // конфиг пользователя
//		'rabbit-server': starter.mock['rabbit-server'],
//		rabbit: starter.mock.rabbit,
//		flexo: starter.mock.flexo,
//		view: starter.mock.view,
//		controller: starter.mock.controller,
		flexo_path: __dirname + '/../scheme/flexo',
		link_path: __dirname + '/../scheme/link',
		view_path: __dirname + '/../scheme/view',
		template_path: __dirname + '/../view/tpl'
	}
);



exports.testInit = function( t ) {
	catchAll( t );
	t.expect( 9 );

	starter.init( config, function( err, module, all ) {
		t.ifError( err );

		t.ok( module );
		t.ok( all );
		t.doesNotThrow( function() {
			t.ok( all['rabbit-server'] );
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
	ok: function( value, message ) {
		if ( message ) {}
		return value;
	},
	deepEqual: function( actual, expected, message ) {
		if ( expected || message ) {}
		return actual;
	},
	notDeepEqual: function( actual, expected, message ) {
		if ( expected || message ) {}
		return actual;
	},
	strictEqual: function( actual, expected, message ) {
		if ( expected || message ) {}
		return actual;
	},
	notStrictEqual: function( actual, expected, message ) {
		if ( expected || message ) {}
		return actual;
	},
	throws: function( block, error, message ) {
		if ( error || message ) {}
		return block;
	},
	doesNotThrow: function( block, error, message ) {
		if ( error || message ) {}
		return block;
	},
	ifError: function( value ) { return value; },
	done: function() { return true;}
};

function catchAll( test ) {
	process.removeAllListeners( 'uncaughtException' );
	process.on( 'uncaughtException', test.done );
}
