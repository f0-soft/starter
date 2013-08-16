var rabbit = require('f0.rabbit');
var flexo = require('f0.flexo');
//var view = require('f0.view');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

var init = function (config, callback){

//    ----------------------------------
//    Блок чтение flexo схем
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
//    Блок инициализации паралельной
//    ----------------------------------


    async.waterfall([
        function(cb){
            rabbit.init(null, cb);
        },
        function(arg, cb){
            flexo.init({storage: rabbit, schemes: flexoGlobal}, cb);
        }
    ], function (err, result) {
        if(err) callback (err);
        else callback (null, result);
    });

}

module.exports = {
    init: init
}