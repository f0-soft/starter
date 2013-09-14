'use strict';

var fs = require( 'fs' );
var async = require( 'async' );
var argstype = require( 'f0.argstype' );


var SETTINGS = {
	rabbit: {
		module: undefined,
		config: {
			mongo: undefined,
			redis: undefined,
			gPath: undefined,
			gFieldDepPath: {},
			gHint: {},
			gHintScore: {}
		}
	},

	flexo: {
		module: undefined,
		config: {
			storage: undefined,
			schemes: {}
		}
	},

	view: {
		module: undefined,
		config: {
			provider: undefined,
			views: {},
			links: undefined,
			templatePath: undefined,
			templateTimeout: undefined
		}
	},

	controller: {
		module: undefined,
		config: {
			redisConfig: undefined,
			view: undefined,
			viewConfig: {},
			flexoSchemes: {},
			configRoleToCompanyView: undefined
		}
	},

	template_path: undefined,
	template_timeout: undefined,

	flexo_path: undefined,
	link_path: undefined,
	view_path: undefined
};
var ROOT_SYSTEM_PROPERTIES = { '_id': {type: 'id'}, 'tsCreate': {type: 'number'}, 'tsUpdate': {type: 'number'} };
var JOIN_SYSTEM_PROPERTIES = { '_id': {type: 'id'} };
var VID_TYPES = ['read', 'modify', 'create', 'delete'];
var VIEW_STOP_NAMES = ['_vid', '_flexo'];
var checks = {};

function myErr( text ) {
	return (new Error( 'f0.starter: ' + text ));
}

function next( callback ) {
	return process.nextTick( Function.bind.apply( callback, arguments ) );
}


checks.init = argstype.getChecker( myErr, [
	['config', true, 'o', [
		['rabbit', true, 'o', [
			['init', true, 'f']
		]],
		['flexo', true, 'o', [
			['init', true, 'f']
		]],
		['view', true, 'o', [
			['init', true, 'f']
		]],
		['controller', true, 'o', [
			['init', true, 'f']
		]],

		['redis', true, 'o'],
		['rabbit_hint', true, 'o'],
		['rabbit_hint_score', true, 'o'],
		['template_path', true, 's'],
		['template_timeout', true, 'n'],
		['controller_role_to_company_view', true, 'o'],

		['flexo_path', true, 's'],
		['link_path', true, 's'],
		['view_path', true, 's']
	]],
	['callback', true, 'f']
] );
function init( config, callback ) {
	var errType = checks.init( arguments );
	var elem;
	var paths, modules;
	var file, files, invalid;
	var links_dict, flexo_dict, dict;
	var i, j, k, keys, key, fields, field, queue;

	if ( errType ) {
		return next( callback, errType );
	}


	// ----------------------------------
	// Копирование модулей
	// ----------------------------------
	modules = ['rabbit', 'flexo', 'view', 'controller'];
	for ( i = 0; i < modules.length; i += 1 ) {
		SETTINGS[modules[i]].module = config[modules[i]];
	}



	// ----------------------------------
	// Копирование прростых настроек
	// ----------------------------------
	SETTINGS.rabbit.config.redis = config.redis;
	SETTINGS.rabbit.config.gHint = config.rabbit_hint;
	SETTINGS.rabbit.config.gHintScore = config.rabbit_hint_score;
	SETTINGS.view.config.templatePath = config.template_path;
	SETTINGS.view.config.templateTimeout = config.template_timeout;
	SETTINGS.controller.config.redisConfig = config.redis;
	SETTINGS.controller.config.configRoleToCompanyView = config.controller_role_to_company_view;



	// ----------------------------------
	// Копирование путей
	// ----------------------------------
	paths = ['flexo_path', 'link_path', 'view_path', 'template_path'];
	for ( i = 0; i < paths.length; i += 1 ) {
		SETTINGS[paths[i]] = config[paths[i]];
		if ( SETTINGS[paths[i]][ SETTINGS[paths[i]].length - 1 ] !== '/' ) {
			SETTINGS[paths[i]] = SETTINGS[paths[i]].concat( '/' );
		}
	}



	// ----------------------------------
	// Подключение путей
	// ----------------------------------
	checks.link = argstype.getChecker( myErr, [
		['link', true, 'o', [
			['name', true, 's'],
			['path', this, 'a', 'a']
		]]
	] );

	files = fs.readdirSync( SETTINGS.link_path );
	links_dict = {};
	for ( i = 0; i < files.length; i += 1 ) {
		file = require( SETTINGS.link_path + files[i] );

		invalid = checks.link( [file] );

		if ( invalid ) {
			return next( callback, invalid );
		}

		links_dict[ file.name ] = file.path;
	}

	// rabbit
	SETTINGS.rabbit.config.gPath = links_dict;

	// view
	SETTINGS.view.config.links = links_dict;



	// ----------------------------------
	// Подключение схем flexo
	// ----------------------------------
	checks.flexo = argstype.getChecker( myErr, [
		['flexo', true, 'o', [
			['name', true, 's'],
			['root', true, 'o', [
				'*', true, 'o', [
					['type', true, 's'],
					['of', false, 's'],
					['from', false, 's'],
					['link', false, 's']
				]
			]],
			['join', false, 'o', [
				'*', false, 'o', [
					['fields', true, 'a', 's'],
					['depend', true, 'a', [
						['scheme', true, 's'],
						['root-field', true, 's']
					]]
				]
			]]
		]]
	] );

	flexo_dict = SETTINGS.flexo.config.schemes;
	files = fs.readdirSync( SETTINGS.flexo_path );
	for ( i = 0; i < files.length; i += 1 ) {
		file = require( SETTINGS.flexo_path + files[i] );

		invalid = checks.flexo( [file] );
		if ( invalid ) { return next( callback, invalid ); }

		dict = {
			all: [],
			mutable: Object.keys( file.root ),
			joinProperties: [],
			joins: (file.join) ? Object.keys( file.join ) : [],
			types: undefined
		};

		// clean mutable
		keys = Object.keys( ROOT_SYSTEM_PROPERTIES );
		for ( j = keys.length - 1; j >= 0; j -= 1 ) {
			key = dict.mutable.indexOf( keys[j] );
			if ( key !== -1 ) {
				dict.mutable.splice( key, 1 );
			}
		}

		// nest joinProperties
		for ( j = 0; j < dict.joins.length; j += 1 ) {
			if ( file.join[ dict.joins[j] ].depend[0] === 'root' ) {
				dict.joinProperties.push( file.join[ dict.joins[j] ].depend[1] );
			}
		}

		// nest all
		keys = dict.mutable.concat( Object.keys( ROOT_SYSTEM_PROPERTIES ) );
		for ( j = 0; j < dict.joins.length; j += 1 ) {
			fields = file.join[dict.joins[j]].fields.concat( Object.keys( JOIN_SYSTEM_PROPERTIES ) ); // only `_id` auto-added to joins

			for ( k = 0; k < fields.length; k += 1 ) {
				keys.push( dict.joins[j] + '_' + fields[k] );
			}
		}
		for ( j = 0; j < keys.length; j += 1 ) { // filter duplicates if any
			if ( dict.all.indexOf( keys[j] ) === -1 ) {
				dict.all.push( keys[j] );
			}
		}

		// nest types
		dict.types = {_id: {type: 'id'}, tsCreate: {type: 'number'}, tsUpdate: {type: 'number'}};
		keys = Object.keys( file.root );
		for ( j = 0; j < keys.length; j += 1 ) {
			dict.types[keys[j]] = file.root[keys[j]];
		}
		for ( j = 0; j < dict.joins.length; j += 1 ) {
			dict.types[ dict.joins[j] + '_' + '_id'] = {type: 'id'};
			for ( k = 0; k < file.join[dict.joins[j]].fields.length; k += 1 ) {
				field = dict.joins[j] + '_' + file.join[dict.joins[j]].fields[k];
				dict.types[field] = require( SETTINGS.flexo_path + dict.joins[j] ).root[file.join[dict.joins[j]].fields[j]];
			}
		}
		// force types
		keys = Object.keys( dict.types );
		for ( j = 0; j < keys.length; j += 1 ) {
			if ( dict.types[keys[j]].type === undefined ) {
				dict.types[keys[j]].type = 'string';
			}
		}



		// rabbit
		SETTINGS.rabbit.config.gFieldDepPath[ file.name ] = {};

		for ( j = 0; j < dict.mutable.length; j += 1 ) {
			elem = file.root[dict.mutable[j]];

			if ( elem.from !== undefined && elem.link !== undefined ) {
				SETTINGS.rabbit.config.gFieldDepPath[ file.name ][ dict.mutable[j] ] = [ elem.link, elem.from ];
			}
		}



		// flexo
		SETTINGS.flexo.config.schemes[ file.name ] = {
			scheme: file,
			dict: dict
		};



		// controller
		SETTINGS.controller.config.flexoSchemes[ file.name ] = {
			read: dict.all,
			modify: dict.mutable,
			readForAdminPanel: [],
			modifyForAdminPanel: []
		};

		for ( j = 0; j < dict.all.length; j += 1 ) {
			SETTINGS.controller.config.flexoSchemes[ file.name ].readForAdminPanel.push( [
				dict.all[j],
				( dict.types[ dict.all[j] ].title || dict.all[j] ),
				( dict.types[ dict.all[j] ].description || '' )
			] );
		}
		for ( j = 0; j < dict.mutable.length; j += 1 ) {
			SETTINGS.controller.config.flexoSchemes[ file.name ].readForAdminPanel.push( [
				dict.mutable[j],
				( dict.types[ dict.mutable[j] ].title || dict.mutable[j] ),
				( dict.types[ dict.mutable[j] ].description || '' )
			] );
		}
	}



	// ----------------------------------
	// Подключение схем view
	// ----------------------------------
	checks.view = argstype.getChecker( myErr, [
		['view', true, 'o', [
			['name', true, 's'],
			['template', false, 's'],
			['config', true, 'o'],
			['root', false, 's'],
			['join', false, 'o', [
				'*', false, 'o'
			]]
		]]
	] );
	checks.viewConfig = argstype.getChecker( myErr, [
		['node', true, 'o', [
			['_vid', false, 's'],
			['_flexo', false, 'o', [
				['type', true, 's'],
				['scheme', true, 'a', [
					['flexo', true, 's'],
					['field', true, 's'],
					['depend_field', false, 's'],
					['path', false, 's']
				]]
			]]
		]]
	] );

	files = fs.readdirSync( SETTINGS.view_path );
	for ( i = 0; i < files.length; i += 1 ) {
		file = require( SETTINGS.view_path + files[i] );

		invalid = checks.view( [ file ] );
		if ( invalid ) { return next( callback, invalid ); }

		dict = {};
		queue = [];
		queue.push( file.config );
		while ( queue.length > 0 ) {
			elem = queue.shift();

			if ( Array.isArray( elem ) ) {
				for ( j = 0; j < elem.length; j += 1 ) {
					if ( Array.isArray( elem[j] ) || typeof elem[j] === 'object' ) {
						queue.push( elem[j] );
					}
				}
				continue;
			}

			invalid = checks.viewConfig( [ elem ] );
			if ( invalid ) { return next( callback, invalid ); }

			if ( elem._vid ) {
				dict[ elem._vid ] = {};

				if ( elem._flexo ) {
					if ( flexo_dict[ elem._flexo.scheme[0] ] === undefined ) { return next( callback, myErr( 'no such flexo' ) ); }
					if ( flexo_dict[ elem._flexo.scheme[0] ].dict.all.indexOf( elem._flexo.scheme[1] ) === -1 ) { return next( callback, myErr( 'no such field in flexo' ) ); }
					if ( elem._flexo.scheme[2] ) {
						if ( !elem._flexo.scheme[3] ) { return next( callback, myErr( 'path name required' ) ); }
						if ( !links_dict[ elem._flexo.scheme[3] ] ) { return next( callback, myErr( 'no such path' ) ); }
					}
					if ( VID_TYPES.indexOf( elem._flexo.type ) === -1 ) { return next( callback, myErr( 'wrong type' ) ); }

					dict[ elem._vid ].flexo = elem._flexo.scheme.concat();
					if ( dict[ elem._vid ].flexo[3] !== undefined ) {
						dict[ elem._vid ].flexo[3] = links_dict[ dict[ elem._vid ].flexo[3] ];
					}
					dict[ elem._vid ].type = elem._flexo.type;
				}
			}

			keys = Object.keys( elem );
			for ( j = 0; j < keys.length; j += 1 ) {
				if ( VIEW_STOP_NAMES.indexOf( keys[j] ) !== -1 ) { continue; }

				if ( Array.isArray( elem[ keys[j] ] ) || typeof elem[ keys[j] ] === 'object' ) {
					queue.push( elem[ keys[j] ] );
				}
			}
		}



		// view
		SETTINGS.view.config.views[ file.name ] = {
			view: file,
			vids: {}
		};

		keys = Object.keys( dict );
		for ( j = 0; j < keys.length; j += 1 ) {
			if ( dict[ keys[j] ].flexo ) {
				SETTINGS.view.config.views[ file.name ].vids[ keys[j] ] = dict[ keys[j] ].flexo;
			}
		}



		// controller
		SETTINGS.controller.config.viewConfig[ file.name ] = {};
		keys = Object.keys( dict );
		for ( j = 0; j < keys.length; j += 1 ) {
			SETTINGS.controller.config.viewConfig[ file.name ][keys[j]] = {};
			if ( dict[keys[j]].type !== undefined ) {
				SETTINGS.controller.config.viewConfig[ file.name ][keys[j]].type = dict[keys[j]].type;
			}
			if ( dict[keys[j]].flexo !== undefined ) {
				SETTINGS.controller.config.viewConfig[ file.name ][keys[j]].flexo = [ dict[keys[j]].flexo[0], dict[keys[j]].flexo[1]];
			}
		}
	}



	return start( callback );
}



function start( callback ) {
	async.waterfall( [
		function( cb ) { // rabbit
			SETTINGS.rabbit.module.init( SETTINGS.rabbit.config, cb );
		},
		function( res, cb ) { // flexo
			SETTINGS.flexo.config.storage = SETTINGS.rabbit.module;
			SETTINGS.flexo.module.init( SETTINGS.flexo.config, cb );
		},
		function( module, cb ) { // view
			SETTINGS.view.config.provider = module;
			SETTINGS.view.module.init( SETTINGS.view.config, cb );
		},
		function( module, cb ) { // controller
			SETTINGS.controller.config.view = module;
			SETTINGS.controller.module.init( SETTINGS.controller.config, cb );
		}
	], function( err, res ) {
		if ( err ) {
			return callback( err );
		}

		return callback( null, SETTINGS.controller.module );
	} );
}



module.exports = {
	init: init
};
