Starter
=====
Общий загрузчик rabbit, flexo, view, controller

## Запуск теста
nodeunit test.js
По умолчанию, тест запускается с mock для переключения на реальные пакеты нужно в ./conf/main.js изменить флаг mock на false

## init( config , callback )
Функци разбора схем и инициализации пакетов
* config - конфиг,
    * config.pRabbit- пакет rabbit,
    * config.pFlexo - пакет flexo,
    * config.pView - пакет view,
    * config.pController - пакет controller,
    * config.schemeFlexo - абсолютный путь к схемам flexo,
    * config.schemeView - абсолютный путь к схемам view,
    * config.template - абсолютный путь к директории шаблонов view
* callback (err ,res)
