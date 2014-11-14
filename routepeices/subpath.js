var mpath = require("mpath");

function discoverSubPath(mvc,next){
  if(mvc.ip.length < 3) return next();
  /*
   Can use this for checking if certian properties need population
   http://stackoverflow.com/questions/16229507/mongoose-self-referential-deep-populate-error
  */
  this.log("subprop");
  mvc.ip.shift();
  mvc.ip.shift();
  var temp = mvc.ip.join(".");
  try{
    var val = mpath.get(temp, mvc.instance);
  }catch(e){
    return next(e);
  }
  if(typeof val == "undefined")
    return next(new RouteError("Non-Existant Sub-Property"));
  if(Array.isArray(val))
    return next(new RouteError("Doesn't support Array Searching"));
  mvc.type = "subprop";
  mvc.subprop = {mpath:temp,value:val};
  this.log("subprop found")

  process.nextTick(next);
}

module.exports = discoverSubPath;
