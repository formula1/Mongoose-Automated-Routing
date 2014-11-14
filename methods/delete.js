
var mongoose = require("mongoose");


module.exports = function(req,res,mvc, next){
  mvc.instance.remove(function(err, instance){
    if(err)
      return next(err);
    delete mvc.instance;
    next(void(0),instance);
  });
}
