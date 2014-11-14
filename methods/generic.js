var help = require(__dirname+"/../core/helper");

module.exports = function(req,res,mvc,next){
  var sync = true;
  var ref = mvc[mvc.type];
  if(mvc.type == "subprop")
    ref = ref.value;
  var argsnames = help.getArgs(ref[mvc.method.name]);
  var argvalues = [];
  for(var i = 0;i<argsnames.length;i++){
    var name = argsnames[i];
    if(name in mvc.args)
      argvalues.push(mvc.args[name])
    else if(/req|request/.test(name))
      argvalues.push(req)
    else if(/res|response/.test(name))
      argvalues.push(res)
    else if(/next|done|cb|callback/.test(name)){
      sync = false;
      argvalues.push(function(error,value){
        if(error) return next(error);
        next(void(0),value);
      });
    }else
      return next(new Error("Missing Argument:"+method+" for the method: "+method));
  }
  var ret;
  try{
    ret = ref[mvc.method.name].apply(ref, argvalues);
  }catch(e){
    next(e);
  }
  if(sync)
    next(void(0),ret);

}
