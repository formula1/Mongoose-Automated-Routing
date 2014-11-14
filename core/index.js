var __root = __dirname+"/..";

var async = require("async");
global.RouteError = require(__dirname+"/RouteError");
var EventEmitter = new require("events").EventEmitter;
var util = require('util');
var chain = require(__dirname+"/Promise.js");
/*
Current
/object/!method.contenttype

Other ideas
/object.method
/object!method.contenttype
/object/method!contenttype

Something important to note, especially for methods
Ah... I thought I could set the document url, but I cant : /

*/
var goodpath = /^\/([a-zA-Z0-9_\-]\/?)+!?[a-zA-Z0-9_\-]+(\.[a-zA-Z0-9]+)?$/;

var methodrgx = /\/![a-zA-Z0-9_\-]+\/?$/;


/*
Verbose
With hold Errors
Pass Errors
*/

var pprp = __root+"/routepeices";
var ppmw = __root+"/middleware";
var ppme = __root+"/methods";



function RouteEmitter(instconfig){
  this.config = require(__dirname + "/Config")(instconfig);
  this.middleware = [
    require(ppmw+"/pathtest.js").bind(this),
    require(ppmw+"/extension.js").bind(this),
    require(ppmw+"/method-detect.js").bind(this)
  ];
  this.builddata = [
    require(pprp+"/model.js").bind(this),
    require(pprp+"/instance.js").bind(this),
    require(pprp+"/subpath.js").bind(this),
    require(pprp+"/method.js").bind(this)
  ];
  this.buildargs = require(pprp+"/arguments.js").bind(this);

  this.request = this.request.bind(this);

}
util.inherits(RouteEmitter, EventEmitter);

RouteEmitter.prototype.log = function(message){
  if(!this.config.verbose){
    return;
  }
  if(message instanceof Error){
    if(this.config.verbose.error){
      return this.config.verbose.fn(message);
    }
  }else if(typeof message == "string"){
    if(this.config.verbose.info){
      return this.config.verbose.fn(message);
    }
  }else
    throw new Error("can't log non-Error or non-String :"+message);
}


RouteEmitter.prototype.request = function(req,res,next){
  var mvc = {};

  var that = this;

  if(typeof next != "function")
    next = function(err){
      if(!err) return this.emit("404",req,res,mvc);
      this.emit("error",err,req,res,mvc);
    }.bind(this);


//  console.log("start")
  new chain(req,mvc)
  .sync(this.emit.bind(this,"pre-process"))
//  .sync(function(){console.log("pp")})
  .async(this.middleware)
//  .sync(function(){console.log("mw")})
  .sync(this.emit.bind(this,"pre-built"))
//  .sync(function(){console.log("pb")})
  .async(this.builddata,mvc)
//  .sync(function(){console.log("bd")})
  .async(this.buildargs)
//  .sync(function(){console.log("ba")})
  .sync(this.emit.bind(this,"built"))
//  .sync(function(){console.log("b")})
  .finish(function(results){
//    console.log("r");
//    console.log(typeof mvc.method);
//    console.log(mvc.method.active?"true":"false");
    if(typeof mvc.method == "undefined" || !mvc.method.active)
      return this.emit("render",req,res,mvc,next)
//    console.log("m");
    this.emit("pre-method",req,res,mvc);
    require(ppme+"/"+mvc.method.type+".js")(req,res,mvc,function(err,result){
      if(err) return next(err);
      this.emit("post-method",req,res,mvc,result);
      this.emit("render",req,res,mvc,next);
    }.bind(this))
  }.bind(this)).fail(next);
}

RouteEmitter.prototype.express = function(app){
  //Need to check for body parser, I do not want conflicts.
  app.all(goodpath,this.express_route.bind(this));
}

RouteEmitter.prototype.express_route = function(req,res,next){
  req.mvcurl = req.originalUrl;
  this.request(req,res,next)
};

module.exports =RouteEmitter;
