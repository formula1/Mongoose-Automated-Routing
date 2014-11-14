var help = require (__dirname+"/../core/helper.js");
var mongoose = require("mongoose");


module.exports = function(req, res, mvc, next){
  var instance = new mvc.model();
  help.strip_and_applyInstance(mvc.args, mvc.model.schema.paths, instance);
  instance.save(function(err){
    if(err)
      return next(err);
    next(void(0),instance);
  });
};
