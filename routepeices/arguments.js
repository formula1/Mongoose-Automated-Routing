var formidable = require('formidable');
var help = require(__dirname+"/../core/helper");

module.exports = function(req,mvc,next){
  if(!mvc.method) return next();
  if(!mvc.method.active) return next();
  if(mvc.method.type == "delete") return next();

  this.log("in args")

  var key_restrict;
  if(mvc.method.type == "generic"){
    var ref = mvc[mvc.type];
    if(mvc.type == "subprop")
      ref = ref.value;
    key_restrict = help.getArgs(ref[mvc.method.name]);
    if(key_restrict.length == 0) return next();
  }
  if(/create|update|search/.test(mvc.method.type)){
    key_restrict = Object.keys(mvc.model.schema.paths);
  }
  this.config.url.argument.fn(req,mvc,key_restrict,function(error,items){
    if(error){
      this.log(error);
       return next(error);
     }
    mvc.args = items;
    next();
  })
}
