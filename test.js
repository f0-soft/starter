// nodeunit тест starter
var starter = require('./lib');
var config = require('./conf/main');


//exports.testInit = function(test){
//    test.expect(2);
//    starter.init(config, function(err, res){
//        test.ifError(err);
//        test.ok(res);
//        test.done();
//    });
//};
starter.init(config, function(err, res){
        if(err) console.log(err);
        else {
            console.log ('qwerty');
            console.log(res);
        }
});