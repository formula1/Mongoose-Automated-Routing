
module.exports = function(mvc, next){
  if(!mvc.method) return next();
  var t = mvc.type;
  var m = mvc.method.name;
  if(t == "subprop"){
    if(typeof mvc.subprop.value[m] == "function"){
      mvc.method.type = "generic";
      return next();
    }
  }else if(t == "instance"){
    if(["update","delete"].indexOf(m) != -1){
      mvc.method.type = m;
      return next();
    }
    if(typeof mvc.model.schema.methods[m] == "function"){
      mvc.method.type = "generic";
      return next();
    }
  }else if(t == "model"){
    if(["create","search"].indexOf(m) != -1){
      mvc.method.type = m;
      return next();
    }
    if(typeof mvc.model.schema.statics[m] == "function"){
      mvc.method.type = "generic";
      return next();
    }
  }
  next(new RouteError("not a method"));
}
