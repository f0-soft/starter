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
			gPresum: undefined,
			gHint: {},
			gHintScore: {},
			gBackRef: {},
			gPrefixCol: undefined
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
			providerAlias: undefined,
			views: {},
			paths: undefined,
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
			viewForAdminPanel: {},
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
var ROOT_SYSTEM_PROPERTIES = { '_id': { type: 'id' }, 'tsCreate': { type: 'number' }, 'tsUpdate': { type: 'number' } };
var JOIN_SYSTEM_PROPERTIES = { '_id': { type: 'id' } };
var VID_TYPES = [ 'read', 'modify', 'create', 'delete' ];
var VIEW_STOP_NAMES = [ '_vid', '_flexo', '_title', '_description' ];
var checks = {};
var INITIALIZED;

function myErr( text ) {
	return (new Error( 'f0.starter: ' + text ));
}
function plainErr( text ) {
	return text;
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

		['redis', false, 'o', [
			['host', false, 's'],
			['port', false, 'n'],
			['options', false, 'o'],
			['max_attempts', false, 'n']
		]],
		['mongo', false, 'o', [
			['host', false, 's'],
			['port', false, 'n'],
			['options', false, 'o'],
			['dbname', false, 's']
		]],

		['rabbit_hint', true, 'o'],
		['rabbit_hint_score', true, 'o'],
		['rabbit_presum', true, 'o'],
		['template_timeout', true, 'n'],
		['collection_alias', true, 'o', [
			'*', false, 's'
		]],

		['flexo_path', true, 's'],
		['link_path', true, 's'],
		['view_path', true, 's'],
		['template_path', true, 's']
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

	if ( errType ) { return next( callback, errType ); }

	if ( INITIALIZED ) { return next( callback, myErr( 'Повторная инициализация системы запрещена' ) ); }



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
	SETTINGS.rabbit.config.mongo = config.mongo;
	SETTINGS.rabbit.config.gHint = config.rabbit_hint;
	SETTINGS.rabbit.config.gHintScore = config.rabbit_hint_score;
	SETTINGS.rabbit.config.gPresum = config.rabbit_presum;
	SETTINGS.view.config.templatePath = config.template_path;
	SETTINGS.view.config.templateTimeout = config.template_timeout;
	SETTINGS.controller.config.redisConfig = config.redis;



	// ----------------------------------
	// Сборка алиасов коллекций
	// ----------------------------------
	dict = { c2p: config.collection_alias, p2c: {} };
	keys = Object.keys( config.collection_alias );
	for ( i = 0; i < keys.length; i += 1 ) {
		if ( config.collection_alias[keys[i]].length !== 2 ) { return next( callback, myErr( 'collection_alias.`' + keys[i] + '` - строка должна быть длиной 2 символа' ) ); }
		if ( dict.p2c[ config.collection_alias[keys[i]] ] !== undefined ) { return next( callback, myErr( 'collection_alias - одинаковые префиксы для коллекций `' + keys[i] + '` и `' + dict.p2c[ config.collection_alias[keys[i]] ] + '`' ) ); }

		dict.p2c[ config.collection_alias[keys[i]] ] = keys[i];
	}

	// rabbit
	SETTINGS.rabbit.config.gPrefixCol = dict;

	// view
	SETTINGS.view.config.providerAlias = dict;



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
	checks.link = argstype.getChecker( plainErr, [
		['link', true, 'o', [
			['name', true, 's'],
			['path', true, 'a', 'a']
		]]
	] );

	files = fs.readdirSync( SETTINGS.link_path );
	links_dict = {};
	for ( i = 0; i < files.length; i += 1 ) {
		file = require( SETTINGS.link_path + files[i] );

		invalid = checks.link( [file] );

		if ( invalid ) { return next( callback, myErr( 'link `' + files[i] + '` - ' + invalid ) ); }
		if ( links_dict[ file.name ] !== undefined ) { return next( callback, myErr( 'link, файл `' + files[i] + '`, name - такое имя уже используется другой схемой связей' ) ); }

		links_dict[ file.name ] = file.path;
	}

	// rabbit
	SETTINGS.rabbit.config.gPath = links_dict;

	// view
	SETTINGS.view.config.paths = links_dict;



	// ----------------------------------
	// Подключение схем flexo
	// ----------------------------------
	checks.flexo = argstype.getChecker( plainErr, [
		['flexo', true, 'o', [
			['name', true, 's'],
			['root', true, 'o', [
				'*', true, 'o', [
					['type', true, 's'],
					['of', false, 's'],
					['from', false, 's'],
					['link', false, 's'],
					['title', false, 's'],
					['description', false, 's']
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
		if ( invalid ) { return next( callback, myErr( 'flexo `' + files[i] + '` - ' + invalid ) ); }
		if ( SETTINGS.flexo.config.schemes[ file.name ] !== undefined ) { return next( callback, myErr( 'flexo, схема `' + files[i] + '`, name - такое имя уже используется другой схемой' ) ); }

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
		for ( j = 0; j < dict.mutable.length; j += 1 ) {
			elem = file.root[dict.mutable[j]];

			if ( elem.from ) {
				if ( dict.types[ dict.mutable[j] ].type !== 'id' && (dict.types[ dict.mutable[j] ].type !== 'array' || dict.types[ dict.mutable[j] ].of !== 'id') ) {
					return next( callback, myErr( 'flexo `' + file.name + '`, field `' + dict.mutable[j] + '` - поле, ссылающееся на другую коллекцию, должно быть типа `id`' ) );
				}

				if ( elem.link && links_dict[elem.link] === undefined ) {
					return next( callback, myErr( 'flexo `' + file.name + '`, field `' + dict.mutable[j] + '` - указанный линк не существует' ) );
				}

				if ( elem.link && links_dict[elem.link][0][0] !== file.name && links_dict[elem.link][1][0] !== file.name ) {
					if ( !SETTINGS.rabbit.config.gFieldDepPath[ file.name ] ) {
						SETTINGS.rabbit.config.gFieldDepPath[ file.name ] = {};
					}

					SETTINGS.rabbit.config.gFieldDepPath[ file.name ][ dict.mutable[j] ] = [ elem.link, elem.from ];
				}

				if ( SETTINGS.rabbit.config.gBackRef[elem.from] === undefined ) {
					SETTINGS.rabbit.config.gBackRef[elem.from] = [];
				}

				SETTINGS.rabbit.config.gBackRef[elem.from].push( [ file.name, dict.mutable[j] ] );

				dict.types[ dict.mutable[j] ].type = 'array';
				dict.types[ dict.mutable[j] ].of = 'id';
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
			SETTINGS.controller.config.flexoSchemes[ file.name ].modifyForAdminPanel.push( [
				dict.mutable[j],
				( dict.types[ dict.mutable[j] ].title || dict.mutable[j] ),
				( dict.types[ dict.mutable[j] ].description || '' )
			] );
		}
	}



	// ----------------------------------
	// Подключение схем view
	// ----------------------------------
	checks.view = argstype.getChecker( plainErr, [
		['view', true, 'o', [
			['name', true, 's'],
			['template', false, 's'],
			['config', true, 'o'],
			['root', false, 's'],
			['join', false, 'o', [
				'*', false, 'o'
			]],
			['aggregate', false, 'o', [
				'*', false, 'o', [
					['flexo', true, 's'],
					['link', true, 'o']
				]
			]]
		]]
	] );
	checks.viewConfig = argstype.getChecker( plainErr, [
		['node', true, 'o', [
			['_vid', false, 's'],
			['_flexo', false, 'o', [
				['type', true, 's'],
				['scheme', false, 'a', [
					['flexo', true, 's'],
					['field', false, 's'],
					['depend_field', false, 's'],
					['link', false, 's']
				]],
				['aggregate', false, 'o', [
					['name', true, 's'],
					['group', false, 'o'],
					['selector', false, 's']
				]]
			]],
			['_title', false, 's'],
			['_description', false, 's']
		]]
	] );

	files = fs.readdirSync( SETTINGS.view_path );
	for ( i = 0; i < files.length; i += 1 ) {
		file = require( SETTINGS.view_path + files[i] );

		invalid = checks.view( [ file ] );
		if ( invalid ) { return next( callback, myErr( 'view `' + files[i] + '` - ' + invalid ) ); }
		// существование корневой схемы
		if ( file.root !== undefined && !flexo_dict[file.root] ) { return next( callback, myErr( 'view `' + files[i] + '`, root - не существует указанной схемы flexo' ) )}

		dict = {};
		queue = [ file.config ];
		while ( queue.length > 0 ) {
			elem = queue.shift();

			// dive into array
			if ( Array.isArray( elem ) ) {
				for ( j = elem.length - 1; j >= 0; j -= 1 ) {
					if ( Array.isArray( elem[j] ) || typeof elem[j] === 'object' ) {
						queue.unshift( elem[j] );
					}
				}
				continue;
			}

			// check node
			invalid = checks.viewConfig( [ elem ] );
			if ( invalid ) { return next( callback, myErr( 'view `' + files[i] + '`, config - ошибка в конфиге `' + invalid + '`' ) ); }
			if ( SETTINGS.controller.config.viewConfig[ file.name ] !== undefined ) { return next( callback, myErr( 'view, схема `' + files[i] + '`, name - такое имя уже используется другой схемой' ) ); }

			// add children
			keys = Object.keys( elem );
			for ( j = keys.length - 1; j >= 0; j -= 1 ) {
				if ( VIEW_STOP_NAMES.indexOf( keys[j] ) !== -1 ) { continue; }

				if ( Array.isArray( elem[ keys[j] ] ) || typeof elem[ keys[j] ] === 'object' ) {
					queue.unshift( elem[ keys[j] ] );
				}
			}

			if ( elem._vid !== undefined ) {
				// повторный _vid
				if ( dict[ elem._vid ] !== undefined ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - такое значение `_vid` уже встречалось в конфиге' ) ); }

				dict[ elem._vid ] = {
					title: elem._title || elem._vid,
					description: elem._description || ''
				};

				if ( elem._flexo ) {
					// корень определен при использовании данных
					if ( file.root === undefined ) { return next( callback, myErr( 'view `' + file.name + '`, root - необходимо название корневой схемы flexo, поскольку конфиг использует данные flexo' ) )}
					// значение type из словаря
					if ( VID_TYPES.indexOf( elem._flexo.type ) === -1 ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - недопустимое значение поля `type`' ) ); }
					// обязательно либо scheme, либо aggregate
					if ( (!elem._flexo.scheme && !elem._flexo.aggregate) || (elem._flexo.scheme !== undefined && elem._flexo.aggregate !== undefined) ) { return next( callback, myErr( 'view `' + file.name + '`, vid `' + elem._vid + '` - должно присутствовать одно из полей: `scheme` или `aggregate`' ) )}

					dict[ elem._vid ].type = elem._flexo.type;

					if ( elem._flexo.scheme ) {
						// существует указанная коллекция
						if ( flexo_dict[ elem._flexo.scheme[0] ] === undefined ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - не существует указанной схемы flexo' ) ); }
						// указано поле связи для некорневой схемы
						if ( elem._flexo.scheme[0] !== file.root && elem._flexo.scheme[2] === undefined ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - `depend_field` обязателен для некорневых схем' ) )}

						dict[ elem._vid ].flexo = [ elem._flexo.scheme[0] ];

						if ( elem._flexo.type !== VID_TYPES[3] ) { // not 'delete'
							// наличие поля схемы
							if ( elem._flexo.scheme[1] === undefined ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - `field` обязателен (второй элемент массива)' ) ); }
							// наличие поля в схеме
							if ( flexo_dict[ elem._flexo.scheme[0] ].dict.all.indexOf( elem._flexo.scheme[1] ) === -1 ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - в схеме flexo отсутствует указанный `field` (второй элемент массива)' ) ); }

							// add field
							dict[ elem._vid ].flexo[1] = elem._flexo.scheme[1];

							if ( elem._flexo.scheme[2] ) {
								// наличие поля связи в схеме
								if ( flexo_dict[file.root].dict.all.indexOf( elem._flexo.scheme[2] ) === -1 ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - указанного `depend_field` не существует (третий элемент массива)' ) );}
								// наличие названия пути в связях через 1+
								if ( flexo_dict[file.root].dict.types[ elem._flexo.scheme[2] ].from !== elem._flexo.scheme[0] && !elem._flexo.scheme[3] ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - для связи через промежуточные схемы `link` обязателен (четвертый элемент массива)' ) )}

								// add depend_field
								dict[ elem._vid ].flexo[2] = elem._flexo.scheme[2];

								if ( elem._flexo.scheme[3] ) {
									// существование указанного пути
									if ( !links_dict[ elem._flexo.scheme[3] ] ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - указанного `link` не существует (четвертый элемент массива)' ) ); }

									// add link
									dict[ elem._vid ].flexo[3] = elem._flexo.scheme[3];
								}
							}
						}
					}

					if ( elem._flexo.aggregate ) {
						if ( !file.aggregate ) { return next( callback, myErr( 'view `' + file.name + '`, aggregate - в схеме отсутствует блок `aggregate` необходимый элементам конфига' ) );}
						if ( !file.aggregate[elem._flexo.aggregate.name] ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - не существует указанного идентификатора агрегации `name`' ) );}
						if ( (!elem._flexo.aggregate.group && !elem._flexo.aggregate.selector) || (elem._flexo.aggregate.group !== undefined && elem._flexo.aggregate.selector !== undefined) ) { return next( callback, myErr( 'view `' + file.name + '`, config, vid `' + elem._vid + '` - должно присутствовать одно из полей: `group` или `selector`' ) );}

						dict[ elem._vid ].aggregate = elem._flexo.aggregate;
					}
				}
			}
		}



		// view
		SETTINGS.view.config.views[ file.name ] = {
			view: file,
			vids: {},
			aggr: {}
		};

		keys = Object.keys( dict );
		for ( j = 0; j < keys.length; j += 1 ) {
			if ( dict[ keys[j] ].flexo && dict[ keys[j] ].flexo[1] !== undefined ) {
				SETTINGS.view.config.views[ file.name ].vids[ keys[j] ] = dict[ keys[j] ].flexo;
			}
			if ( dict[ keys[j] ].aggregate ) {
				SETTINGS.view.config.views[ file.name ].aggr[ keys[j] ] = dict[ keys[j] ].aggregate;
			}
		}



		// controller
		SETTINGS.controller.config.viewConfig[ file.name ] = {};
		SETTINGS.controller.config.viewForAdminPanel[ file.name ] = [];
		keys = Object.keys( dict );
		for ( j = 0; j < keys.length; j += 1 ) {
			SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ] = {};
			SETTINGS.controller.config.viewForAdminPanel[ file.name ].push( [
				keys[j],
				dict[ keys[j] ].title,
				dict[ keys[j] ].description
			] );

			if ( dict[ keys[j] ].type !== undefined ) {
				SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ].type = dict[ keys[j] ].type;
			}
			if ( dict[ keys[j] ].flexo !== undefined ) {
				SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ].flexo = [];

				if ( dict[ keys[j] ].flexo[0] !== undefined ) {
					SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ].flexo[0] = dict[ keys[j] ].flexo[0];
				}
				if ( dict[ keys[j] ].flexo[1] !== undefined ) {
					SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ].flexo[1] = dict[ keys[j] ].flexo[1];
				}
			}
			if ( dict[ keys[j] ].aggregate !== undefined ) {
				SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ].flexo = [];

				if ( file.aggregate[dict[ keys[j] ].aggregate.name].flexo !== undefined ) {
					SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ].flexo[0] = file.aggregate[dict[ keys[j] ].aggregate.name].flexo;
					if ( dict[ keys[j] ].aggregate.selector !== undefined ) {
						SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ].flexo[1] = dict[ keys[j] ].aggregate.selector;
					} else { // group
						SETTINGS.controller.config.viewConfig[ file.name ][ keys[j] ].flexo[1] = dict[ keys[j] ].aggregate.group[Object.keys( dict[ keys[j] ].aggregate.group )[0]].substr( 1 );
					}
				}

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

		INITIALIZED = true;

		return callback( null, SETTINGS.controller.module );
	} );
}



module.exports = {
	init: init,
	config: require( '../../conf/main' )
};
