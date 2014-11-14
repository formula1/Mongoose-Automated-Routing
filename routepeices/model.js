var mongoose = require("mongoose");

function discoverModel(mvc,next){
  var mns = mongoose.modelNames();
  if(mns.length == 0)
    return next(new RouteError("No Models Available"));
  if(mns.indexOf(mvc.ip[0]) == -1)
    return next(new RouteError("Non-Existant Model: "+mvc.ip[0]+" in "+JSON.stringify(mns)));
  mvc.type = "model";
  mvc.model = mongoose.model(mvc.ip[0]);
  process.nextTick(next);
}


module.exports = discoverModel;
