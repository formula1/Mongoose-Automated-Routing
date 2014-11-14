var async = require("async");

function Defered(){
  this.toCall = [];
  this.oldargs = [];
  this.done = 0;
  this.onFail = function(e){
    e.message = "In Chain["+this.done+"] deep \n" +e.message;
    throw e;
  };
  this.onFinish = function(results){
    console.log(results);
  };

  this.args = [];
  if(arguments.length > 0){
    this.args = Array.prototype.slice.call(arguments, 0);
  }
  this.lastresults;
  this.results = [];
  process.nextTick(this.run.bind(this));
}

Defered.prototype.async = function(fn){
  if(arguments.length == 0) throw new Error("you need a function");
  if(arguments.length > 1){
    var args = Array.prototype.slice.call(arguments, 1);
    this
      .set.apply(this,args)
      .async(fn)
      .unset();
  }else if(typeof fn == "function"){
    this.toCall.push(fn);
  }else if(Array.isArray(fn)){
    for(var i=0;i<fn.length;i++)
      this.async(fn[i])
  }else{
    throw new Error("This Method accepts("
          +"FUNCTION|[FUNCTION], "
          +"...arg"
          +") \n typeof arg[0]:"+typeof fn
          +" \n Array.isArray("+((Array.isArray(fn))?"true":"false")+")"
        );
  }
  return this;
}


Defered.prototype.sync = function(fn){
  if(arguments.length == 0) throw new Error("you need a function");
  if(arguments.length > 1){
    var args = Array.prototype.slice.call(arguments, 1);
    this
      .set.apply(this,args)
      .sync(fn)
      .unset();
  }else if(typeof fn == "function"){
    this.toCall.push(function(){
      var args = Array.prototype.slice.call(arguments, 0);
      next = args.pop();
      try{
        next(void(0),fn.apply(fn,args));
      }catch(e){
        next(e);
      }
    });
  }else if(Array.isArray(fn)){
    for(var i=0;i<fn.length;i++)
      this.sync(fn[i])
  }else{
    throw new Error("This Method accepts("
          +"FUNCTION|[FUNCTION], "
          +"...arg"
          +") \n typeof fn:"+typeof fn
          +" \n Array.isArray("+((Array.isArray(fn))?"true":"false")+")"
        );
  }
  return this;
}

Defered.prototype.set = function(){
  var args = Array.prototype.slice.call(arguments, 0);
  this.toCall.push(function(){
    var next = Array.prototype.slice.call(arguments, 0).pop();
    this.oldargs.push(this.args);
    this.args = args;
    next(void(0));
  }.bind(this));
  return this;
}

Defered.prototype.unset = function(){
  this.toCall.push(function(){
    var next = Array.prototype.slice.call(arguments, 0).pop();
    this.args = this.oldargs.pop();
    next(void(0));
  }.bind(this));
  return this;
}



Defered.prototype.fail = function(fn){
  if(typeof fn != "function")
    throw new Error("Can't use a non-function as error handler");
  this.onFail = fn;
  return this;
}
Defered.prototype.finish = function(fn){
  if(typeof fn != "function")
    throw new Error("Can't use a non-function as finish handler");
  this.onFinish = fn;
  return this;
}

Defered.prototype.run = function(){
  var temp = [].concat(this.args);
  temp.push(function(err){
    if(err){
      return this.onFail(err);
    }
    var lr = Array.prototype.slice.call(arguments, 0);
    lr.shift();
    lr = (typeof lr != "undefined")?lr:null;
    this.lastresult = lr;
    this.results.push(lr);
    process.nextTick(this.run.bind(this));
  }.bind(this))
  if(this.toCall.length == 0){
    return this.onFinish(this.results);
  }
  var thisone = this.toCall.shift();
  thisone.apply(thisone,temp)
}


module.exports = Defered;
