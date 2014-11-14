var querystring = require("querystring");
var formidable = require('formidable')
var help = require(__dirname+"/helper.js");
var mpath = require("mpath");

module.exports = function(config){
  if(typeof config == "undefined")
    config = {};
  //============ERROR==================
  if(!("verbose" in config))
    config.verbose = {};
  if(typeof config.verbose == "boolean"
  || (  typeof config.verbose == "string"
    &&  /true|false/.test(config.verbose)
    )
  ){
    if(config.verbose == true){
      config.verbose = {
        fn: function(){console.log.apply(console,arguments)},
        error:true,
        info:true
      }
    }else{
      config.verbose = false;
    }
  }else{
    if(typeof config.verbose == "function"){
      config.verbose = {fn: config.verbose};
    }
    if(typeof config.verbose == "object"){
      if(typeof config.verbose.fn == "undefined")
        config.verbose.fn = function(){console.log.apply(console,arguments)};
      else if(typeof config.verbose.fn != "function")
        throw new Error("verbose fn needs to be a function");
      if(typeof config.verbose.error == "undefined")
        config.verbose.error = true;
      if(typeof config.verbose.info == "undefined")
        config.verbose.info = true;
    }else{
      throw new Error("Config.error.verbose must be either a function or a boolean");
    }
  }
  //============DEFAULT==================
  if(typeof config.url == "undefined")
    config.url = {};
  if(typeof config.url.defaultExstenstion == "undefined")
    config.url.defaultExtension = "html";
  if(typeof config.url.argument == "undefined")
    config.url.argument = {};
  if(typeof config.url.argument.fn == "undefined"){
    config.url.argument.fn = function(req,mvc,keys,next){
      var poss;
      var URL = mvc.URL;
      if(URL.method == "get")
        return next(void(0),help.restrict(keys,querystring.parse(URL.search)));
      var form = new formidable.IncomingForm();
      form.maxFields = keys.length;
      form.parse(req, function(err, fields, files) {
        var replace = {};
        var counters = {};
        for(var i in fields){
          if(/.+\[.*\].*/.test(i)){
            var c = i;
            var total_string ="";
            var p;
            while((p = c.indexOf("[")) != -1){
              total_string += c.substring(0,p)+".";
              var n = c.indexOf("]");
              if(n == -1) return next(new Error("Bad Data"))
              var inside = c.substring(p+1,n);
              if(inside == ""){
                counters[c] = (counters[c])?counters[c]++:0;
                inside = counters[c];
              }
              total_string += inside;
              c = c.substring(n+1);
            };
            replace[total_string] = fields[i];
          }else{
            replace[i] = fields[i];
          }
        }
        if(err) return next(err);
        next(void(0),help.restrict(keys,replace));
      });
    };
  }
  if(typeof config.url.argument.onGET == "undefined")
    config.url.argument.onGET = true;
  if(typeof config.url.argument.onPOST == "undefined")
    config.url.argument.onPOST = true;
  if(typeof config.url.argument.onCUSTOM == "undefined")
    config.url.argument.onCUSTOM = true;




  return config;
}
