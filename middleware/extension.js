var mime = require("mime")
var accepts = require("accepts");


module.exports = function(req,mvc,next){
  this.log("accept header == "+JSON.stringify(req.headers["accept"]));
  var n;
  if(( n = mvc.URL.pathname.lastIndexOf("."))!= -1){
    mvc.URL.extension = mvc.URL.pathname.substring(n+1);
    mvc.URL.pathname = mvc.URL.pathname.substring(0,n);
  }else{
    if(this.config.url.defaultExtension)
      mvc.URL.extension = this.config.url.defaultExtension;
  }

  if(!req.headers["accept"])
    req.headers["accept"] = mime.lookup(mvc.URL.extension)+";";

  req.accepts = accepts(req);
  if(mvc.URL.extension && !req.accepts.types(mvc.URL.extension))
    return next(new RouteError(mvc.URL.extension+" is not allowed in "+req.headers["accept"]));

  next();
}
