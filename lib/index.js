// система заупска модулей f0
var rabbit;
var flexo;
var view;
var controller;
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

var init = function (config, callback){

    if(config.pRabbit) rabbit = config.pRabbit;
    else {
        callback ('Starter: config.pRabbit - default.');
        return;
    }
    if(config.pFlexo) flexo = config.pFlexo;
    else {
        callback ('Starter: config.pFlexo - default.');
        return;
    }
    if(config.pView) view = config.pView;
    else {
        callback ('Starter: config.pView- default.');
        return;
    }
    if(config.pController) controller = config.pController;
    else {
        callback ('Starter: config..pController- default.');
        return;
    }

//    ----------------------------------
//    Блок разбор flexo схем
//    ----------------------------------
    var filename = fs.readdirSync(config.scheme_flexo);
    //  массивы полей для редактирования и чтения для Controller
    var flexoGlobalController = {};
    // объект для модуля flexo
    var flexoGlobal = {};

    // массив названий флексосхем
    var aFlexoName = [];

    // разбор флексосхемы для контролера и flexo
    for(var i = 0; i < filename.length; i++){
        var buff = require(config.scheme_flexo+'/'+filename[i]);
        var modify = [];
        var type = {};
        for(key in buff.root){
            modify.push(key);
            if(!buff.root[key].type) {
                callback('ERR: В схеме '+buff.name+' поле '+key+' без type');
                return;
            }
            type[key] = buff.root[key];
        }

        flexoGlobal[buff.name] = {
            scheme: buff,
            dict: {
                mutable: modify,
                types: type,
                joins: [],
                joinProperties: []
            }
        }

        aFlexoName.push(buff.name);
    }

    for(var i = 0; i < aFlexoName.length; i++){
        var buffFlexo = flexoGlobal[aFlexoName[i]].scheme;
        var types = flexoGlobal[aFlexoName[i]].dict.types;
        var read = [];
        if(buffFlexo.join){
            for(key in buffFlexo.join){
                for(var g = 0; g < buffFlexo.join[key].fields.length; g++){
                    read.push(key+'_'+buffFlexo.join[key].fields[g]);
                    types[key+'_'+buffFlexo.join[key].fields[g]] = flexoGlobal[key].dict.types[buffFlexo.join[key].fields[g]];
                }
                if(buffFlexo.join[key].depend[0] === 'root')  flexoGlobal[aFlexoName[i]].dict.joinProperties.push(buffFlexo.join[key].depend[1]);
                flexoGlobal[aFlexoName[i]].dict.joins.push(buffFlexo.join[key].depend[0]);

            }
        }

        read = _.union(read, flexoGlobal[aFlexoName[i]].dict.mutable);
        flexoGlobal[aFlexoName[i]].dict.all = read;
        flexoGlobalController[aFlexoName[i]] = {
            read: read,
            modify: flexoGlobal[aFlexoName[i]].dict.mutable
        }
    }

//    ----------------------------------
//    Блок разбор flexo схем
//    ----------------------------------

    filename = fs.readdirSync(config.scheme_view);
    //  массив _vid для контролерра
    var viewGlobalController = {};
    var viewGlobalView = {};

    for(var i = 0; i < filename.length; i++){
        var buff = require(config.scheme_view+'/'+filename[i]);

        var aPoint = [{in: buff.config , url: ''}];
        viewGlobalController[buff.name] = {};
        viewGlobalView[buff.name] = {view: buff};
        // прогон поконфигу
        while (aPoint.length > 0){
            var point = aPoint[0];
            if(point.in['_vid']){
                if(!point.in['_flexo']) viewGlobalController[buff.name][point.in['_vid']] = {};
                else {
                    if(!point.in._flexo['type'] || !point.in._flexo['scheme']) {
                        callback('Ошибка разбора view-схемы '+buff.name+' _vid - '+point.in['_vid']);
                    } else {
                        viewGlobalController[buff.name][point.in['_vid']] = {type: point.in._flexo['type'], flexo: point.in._flexo['scheme']};
                        var aBuff =  point.url.split('/:');
                        aBuff.shift();
//                        viewGlobalView[buff.name][point.in['_vid']] = aBuff;
                    }
                }
            }
            aPoint.shift();
            if(point.in && typeof(point.in) === 'object') {
                if(_.isArray(point.in)) {
                    for(var g = 0; g < point.in.length ; g++){
                        aPoint.unshift({in: point.in[g], url: point.url+'/:'+g});
                    }
                } else {
                     for(key in point.in){
                         aPoint.unshift({in: point.in[key], url:  point.url+'/:'+key});
                     }
                }
            }
        }
    }

//    ----------------------------------
//    Блок инициализации паралельной
//    ----------------------------------
    async.waterfall([
        function(cb){
            rabbit.init(null, cb);
        },
        function(arg, cb){
            flexo.init({storage: rabbit, schemes: flexoGlobal}, cb);
        },
        function(arg, cb){
            view.init({provider: arg, views: flexoGlobal, templatePath: config.template}, cb);
        },
        function(arg, cb){
            controller.init({view: arg, viewConfig: viewGlobalController, flexoSchemes: flexoGlobalController}, cb);
        }
    ], function (err, result) {
        if(err) callback (err);
        else callback (null, result);
    });

}

module.exports = {
    init: init
}