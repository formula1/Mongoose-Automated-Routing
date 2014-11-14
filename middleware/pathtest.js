var url = require("url");
var goodpath = /^\/([a-zA-Z0-9_\-]\/?)+!?[a-zA-Z0-9_\-]+(\.[a-zA-Z0-9]+)?$/;
var hidden = /\/!?_[A-Za-z0-9_\-]+\/?/;
var emptyrgx = /.*\/\/.*/;


module.exports = function(req,mvc,next){
  mvc.URL = url.parse(req.mvcurl);
  if(!goodpath.test(mvc.URL.pathname))
    return next(new RouteError("Has Bad Characters"));
  if(hidden.test(mvc.URL.pathname))
    return next(new RouteError("Hidden Part"));
  if(emptyrgx.test(mvc.URL.pathname))
    return next(new RouteError("Empty Part"));
  next();
}
