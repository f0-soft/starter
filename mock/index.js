
var rabbit = function (config, callback){
    callback(null, 'Ok');
}

var flexo = function (options, callback){
    if(!options.storage) {callback('Flexo: отсутсвует storage!');return;}
    if(!options.schemes) {callback('Flexo: отсутсвует schemes!');return;}
    callback(null, {find: function(){}, insert: function(){}, modify: function(){}, delete: function(){}});
}

var view = function (options, callback){
    if(!options.provider) {callback('View: отсутсвует provider!');return;}
    if(!options.views) {callback('View: отсутсвует views!');return;}
    if(!options.templatePath) {callback('View: отсутсвует templatePath!');return;}
    callback(null,  {getTemplate: function(){}, find: function(){}, insert: function(){}, modify: function(){}, delete: function(){}});
}

var controller = function (config, callback){
    if(!config.viewConfig) {callback('Controller: отсутсвует viewConfig!');return;}
    if(!config.view) {callback('Controller: отсутсвует view!');return;}
    if(!config.flexoSchemes) {callback('Controller: отсутсвует flexoSchemes!');return;}
    callback(null, true);
}



module.exports = {
    pRabbit:{init: rabbit, find: function(){}, insert: function(){}, modify: function(){}, delete: function(){}},
    pFlexo: {init: flexo},
    pView: {init: view},
    pController: {init: controller}
}