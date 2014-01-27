Starter
=====
Общий загрузчик rabbit, flexo, view, controller



## config
Конфигурация по умолчанию. Ее следует использовать для создания собственной конфигурации.



## mock
Набор имитаций модулей



## init( config , callback )
Производит подготовку настроек модулей, запуск модулей в фиксированной последовательности
* `config` - объект
    * `rabbit-server` - объект, содержит функции модуля
    * `rabbit` - объект, содержит функции модуля
    * `flexo` - объект, содержит функции модуля
    * `flexo-client` - объект, содержит функции модуля
    * `view` - объект, содержит функции модуля
    * `controller` - объект, содержит функции модуля
    * `flexo_path` - строка, путь к каталогу схем `flexo`
    * `link_path` - строка, путь к каталогу связей между схемами
    * `view_path` - строка, путь к каталогу схем `view`
    * `template_path` - строка, путь к каталогу шаблонов `view`
    * `rabbit_host` - строка, адрес сервера `rabbit`
    * `rabbit_port` - строка, порт сервера `rabbit`
    * `flexo_host` - строка, адрес сервера `flexo`
    * `flexo_port` - число, порт сервера `flexo`
    * `redis` - объект
        * `host` - строка, адрес сервера
        * `port` - число, порт сервера
        * `options` - объект
        * `max_attempts` - число, максимальное колчество попыток для контроллера
    * `mongo` - объект
        * `host` - строка, адрес сервера
        * `port` - число, порт сервера
        * `options` - объект
        * `dbname` - строка, название базы
    * `template_timeout` - число, время жизни функции шаблонизации `view` в кеше
    * `collection_alias` - объект, содержит префиксы для коллекций, ключ - название коллекции, значение - уникальная на справочник строка из 2 символов
* `callback ( err, final, all )` - функция
    * `final` - объект, содержит функции проинициализированного модуля `controller`
    * `all` - объект со всеми проинициализированными модулями: `rabbit-server`, `rabbit`, `flexo`, `view`, `controller`
    


## Запуск
    var _ = require( 'underscore' );
    var starter = require( 'f0.starter' );
    
    // создание конфига
    var config = _.extend(
        // пустой объект, который вберет в себя все последующие настройки
        {},
        
        // конфиг по умолчанию
        starter.config,
        
        // конфиг пользователя
        {
            // подключение имитаций модулей, если необходимо
            'rabbit-server': starter.mock['rabbit-server'],
            rabbit: starter.mock.rabbit,
            flexo: starter.mock.flexo,
            view: starter.mock.view,
            controller: starter.mock.controller,
            
            // определение путей к директориям
            flexo_path: __dirname + '/../scheme/flexo',
            link_path: __dirname + '/../scheme/link',
            view_path: __dirname + '/../scheme/view',
            template_path: __dirname + '/../view/template'
        }
    );
    
    starter.init( config, function( err, controller, all ) {
        // система проинициализирована
    } );
