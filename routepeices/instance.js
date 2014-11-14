

function discoverInstance(mvc,next){
  if(mvc.ip.length < 2) return next();
  mvc.model.findOne({_id:mvc.ip[1]}, function(err, doc){
    if(err)
      return next(new RouteError(err));
    if(!doc)
      return next(new RouteError("Non-Existant Instance"));
    mvc.type = "instance";
    mvc.instance = doc;
    next();
  });
}


module.exports = discoverInstance;
