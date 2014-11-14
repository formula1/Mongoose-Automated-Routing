var querystring = require("querystring");
var methodrgx = /\/![a-zA-Z0-9_\-]+\/?$/;

module.exports = function(req,mvc,next){
  mvc.ip = mvc.URL.pathname.split("/");
  mvc.ip.shift();
  mvc.type = "";
  if(methodrgx.test(mvc.URL.pathname)){
    mvc.method = {name:mvc.ip.pop().substring(1),active:false};
    mvc.type = "method";
  }
  if(req.method.toLowerCase() == "get"){
    if(this.config.url.argument.onGET
    && mvc.type == "method"
    && mvc.URL.search ){
      mvc.method.active = true;
    }
    return next();
  }
  if(req.method.toLowerCase() == "post"){
    if(mvc.type != "method")
      return next(new RouteError("You are posting with no method" ))
    if(this.config.url.argument.onPOST){
      mvc.method.active = true;
    }
  }else if(this.config.url.argument.onCUSTOM){
    this.log("Alternative method");
    if(mvc.type == "method" && mvc.method.toLowerCase() != req.method.toLowerCase()){
      return next(new RouteError("Your requested method["+req.method+"] != spoken method["+mvc.method+"]" ))
    }
    mvc.method.active = true;
  }
  next();
}
