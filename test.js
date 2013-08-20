// nodeunit тест starter
var starter = require('./lib');
var config = require('./conf/main');
var _ = require('underscore');

if(config.mock === false){
    var rabbit = require('f0.rabbit');
    var flexo = require('f0.flexo');
    var view = require('f0.view');
    var controller = require('f0.controller');
    _.extend(config,{
        pRabbit: rabbit,
        pFlexo: flexo,
        pView: view,
        pController: controller
    })
} else {
    _.extend(config, require('./mock'));
}

exports.testInit = function(test){
    test.expect(2);
    starter.init(config, function(err, res){
        test.ifError(err);
        test.strictEqual(res, true , 'Controller не инициализировался!');
        test.done();
    });
};

