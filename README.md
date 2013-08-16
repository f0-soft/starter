Starter
=====
Общий загрузчик rabbit, flexo, view, controller

## Запуск теста
nodeunit test.js

## init( config , callback )
Функци инициализации и разбор схема
* config - конфиг,
    * config.schemeFlexo - абсолютный путь к схемам flexo,
    * config.schemeView - абсолютный путь к схемам view,
    * config.template - абсолютный путь к директории шаблонов view
* callback (err ,res)

## start()
Запуск модулей rabbit, flexo, view, controller
* callback (err ,res)
