var mongoose = require("mongoose");
var help = require (__dirname+"/../core/helper.js");

module.exports = function(req, res, mvc, next){
  help.strip_and_applyInstance(mvc.args, mvc.model.schema.paths, mvc.instance);
  mvc.instance.save(function(err){
    if(err)
      return next(err);
    next(void(0),mvc.instance);
  });
};
