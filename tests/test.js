var assert = require("assert")
var request = require("request");
var express = require("express");
var mongoose = require("mongoose");

var fs = require("fs");
var config = JSON.parse(fs.readFileSync(__dirname+"/config.json"));



var Maroop;
var mri;
var app;
describe('#require', function(){
  it('should load maroop without a problem', function(){
    Maroop = require("../core/index");
  })
})

describe('RouteEmitter',function(){
  it('should be able to given no arguments to construct', function(){
    mri = new Maroop();
  });
  it('should still default when given an empty object', function(){
    mri = new Maroop({});
  });
  it('should be able to handle verbose as true or false', function(){
    mri = new Maroop({
      verbose:true
    });
    mri = new Maroop({
      verbose:false
    });
  });
  it('should be able to handle a custom verbose listener', function(){
    mri = new Maroop({
      verbose:{
        fn:function(message){
        return message
        }
      }
    });
  });
  describe("#log",function(){
    it('should return same value sent in', function(){
      var om = "Orginal Message";
      assert.equal(om, mri.log(om));
    });
    it('should not return when config.verbose.info == false', function(){
      mri.config.verbose.info = false;
      assert.equal("undefined", typeof mri.log("Should not show"));
    });
    it('should still return when an error given and info:false,error:true', function(){
      var anerr = new Error("this is an Error");
      assert.equal(anerr.message, mri.log(anerr).message);
    });
    it('should not return when config.verbose.error == false', function(){
      mri.config.verbose.error = false;
      var anerr = new Error("this is an Error");
      assert.equal("undefined", typeof mri.log(anerr));
    });
    it('should return when string given and info:true,error:false', function(){
      mri.config.verbose.info = true;
      var astr = "this is a String";
      assert.equal(astr, mri.log(astr));
    });
  })
  describe("#express",function(){
    it('It should be able to hook into an express engine', function(){
      app = express();
      mri.express(app);
      app.listen(config.http.port);
    })
    it('It should only emit error without a callback', function(next){
      var temp = true;
      mri.once("error",function(req,res,mvc){
        temp = false;
      })
      request.get(
        'http://localhost:3000/ModelName/InstanceID/SubpropNS/!MethodName.ext',
        function (error, response, body){
          if(temp) return next();
          next(new Error(iner.message));
        }
      );
    });
    it('It should return error back to Express', function(next){
      request.get(
        'http://localhost:3000/ModelName/InstanceID/SubpropNS/!MethodName.ext',
        function (error, response, body){
          if(error) return next(error);
          try{
            assert.equal(500,response.statusCode);
          }catch(e){
            return next(e);
          }
          next();
      });
    });
  })
  describe("#events",function(){
    var nee;
    var fn1 = function(req,mvc){
      nee = false;
    };
    var fn2 = function(req,res,mvc,next){
      res.send("ok");
    };
    before(function() {
      nee = true;
      mri.on("error",fn1)
      mri.on("render",fn2)
    });
    after(function() {
      nee = true;
      mri.removeListener("error",fn1)
      mri.removeListener("render",fn2);
    });
    before(function(done) {
        mongoose.connect(config.mongo.url,config.mongo.options, function(error) {
            if (error) console.error('Error while connecting:\n%\n', error);
            console.log('connected');
            var DummyModel= require(__dirname + "/DummyModel.js");
            done(error);
        });
    });
    it('should accept listeners', function(){
      var lis = function(){
        assert.equal(3, arguments.length);
        assert.equal("First", arguments[0]);
        assert.equal("Second", arguments[1]);
        assert.equal("Third", arguments[2]);
      }
      mri.once("bs-event", lis);
      mri.emit("bs-event","First","Second","Third");
    })
    it('should emit errors synchronously', function(next){
      var lis = function(t){
        assert.equal("True", t);
      }
      mri.on("bs-event", lis);
      try{
        mri.emit("bs-event","Not True");
      }catch(e){
        return next()
      }
      next(new Error("Did not Throw an Error"));
    })
    var events = ["pre-process", "pre-built","built","render"];
    for(var i=0;i<events.length;i++){
      (function anon(event){
        it('should emit '+event+' when we make a successful get call', function(next){
          var temp = false;
          mri.once(event,function(req,res,mvc){
            temp = true;
          });
          request.get(
            'http://localhost:3000/DummyModel',
            function (error, response, body){
              try{
                assert.equal(true,nee);
                assert.equal("ok",body);
                assert.equal(response.statusCode,200);
              }catch(e){
                return next(new Error("this was not a successful call"))
              }
              if(temp) return next();
              next(new Error("It did not emit event: "+event));
            }
          );
        });
      })(events[i]);
    }
  })
  describe('#methods', function(){
    var instance;
    var nm = false;
    it('should be able to call syncronous static methods', function(next){
      mri.once("post-method",function(req,res,mvc,result){
        res.send(result);
      })
      request.post(
        'http://localhost:3000/DummyModel/!syncStatic',
        {form:{}},
        function (error, response, body){
          if(error){
            return next(error);
          }
          if(response.statusCode != 200)
            return next(new Error(body));
          try{
            assert.equal(response.statusCode,200);
            assert.equal(body,"Static Method with req and res");
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });
    it('should be able to call asyncronous static methods', function(next){
      mri.once("post-method",function(req,res,mvc,result){
        res.send(JSON.stringify(result));
      })
      request.post(
        'http://localhost:3000/DummyModel/!asyncStatic',
        {form:{str1:"string1",str2:"string2",str3:"string3"}},
        function (error, response, body){
          if(error)
            return next(error);
          try{
            assert.equal(response.statusCode,200);
            assert.equal(JSON.parse(body).join(" "),"No issue in your async method");
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });
    it('should be able to create call', function(next){
      mri.once("pre-built",function(req,mvc){
        if(!mvc.method || !mvc.method.active)
          nm = true;
      })
      mri.once("post-method",function(req,res,mvc,result){
        res.send(JSON.stringify(result.toJSON()));
      })
      request.post(
        'http://localhost:3000/DummyModel/!create',
        {form:{
          a_string:"something",
          a_string_array:["one","two","three"],
          a_string_enum:"b"
        }},
        function (error, response, body){
          if(error)
            return next(error);
          if(nm) return next(new Error("Wasn't active or a method"));
          try{
            assert.equal(response.statusCode,200);
            instance = JSON.parse(body);
            console.log(body);
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });
    it('should be able to request instance we just created', function(next){
      mri.once("render",function(req,res,mvc,next){
        res.send(JSON.stringify(mvc.instance.toJSON()));
      })
      request.get(
        'http://localhost:3000/DummyModel/'+instance._id,
        function (error, response, body){
          if(error)
            return next(error);
          if(nm) return next(new Error("Wasn't active or a method"));
          try{
            assert.equal(response.statusCode,200);
            assert.equal(instance._id,JSON.parse(body)._id);
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });
    it('should be able to update instance we just created', function(next){
      mri.once("post-method",function(req,res,mvc,result){
        res.send(JSON.stringify(result.toJSON()));
      })
      var new_value = "A new Value";
      request.post(
        'http://localhost:3000/DummyModel/'+instance._id+'/!update',
        {form:{a_string:new_value}},
        function (error, response, body){
          if(error)
            return next(error);
          if(nm) return next(new Error("Wasn't active or a method"));
          try{
            assert.equal(response.statusCode,200);
            assert.equal(instance._id,JSON.parse(body)._id);
            assert.equal(new_value,JSON.parse(body).a_string);
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });
    it('should be able to call syncronous instance methods', function(next){
      mri.once("post-method",function(req,res,mvc,result){
        res.send(result);
      })
      request.post(
        'http://localhost:3000/DummyModel/'+instance._id+'/!syncMethod',
        {form:{}},
        function (error, response, body){
          if(error){
            return next(error);
          }
          if(response.statusCode != 200)
            return next(new Error(body));
          try{
            assert.equal(response.statusCode,200);
            assert.equal(body,"SyncMethod Success");
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });
    it('should be able to call asyncronous instance methods', function(next){
      mri.once("post-method",function(req,res,mvc,result){
        res.send(result);
      })
      request.post(
        'http://localhost:3000/DummyModel/'+instance._id+'/!asyncMeth',
        {form:{}},
        function (error, response, body){
          if(error){
            return next(error);
          }
          if(response.statusCode != 200)
            return next(new Error(body));
          try{
            assert.equal(response.statusCode,200);
            assert.equal(body,"AsyncMethod Success");
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });
    it('should be able to call property methods', function(next){
      mri.once("post-method",function(req,res,mvc,result){
        res.send(result);
      })
      request.post(
        'http://localhost:3000/DummyModel/'+instance._id+'/a_string/!toUpperCase',
        {form:{}},
        function (error, response, body){
          if(error){
            return next(error);
          }
          if(response.statusCode != 200)
            return next(new Error(body));
          try{
            assert.equal(response.statusCode,200);
            assert.equal(body,"A NEW VALUE");
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });
    describe("#search",function(){
      before(function(done){
        var trial = 0;
        var tfn = function(req,res,mvc,result){
          res.send("ok");
        }
        mri.on("post-method",tfn)
        var temp = function(i){
          request.post(
            'http://localhost:3000/DummyModel/!create',
            {form:{
              a_string:"counter"+Math.ceil(i/5),
              a_string_array:["one"+i],
              a_string_enum:"c"
            }},
            function (error, response, body){
              if(error){
                return done(error);
              }
              if(response.statusCode != 200){
                return done(new Error(body));
              }
              trial++;
              if(trial<10){
                return temp(trial);
              }
                mri.removeListener("post-method",tfn)
                done();
            }
          );
        }
        temp(0);
      })
      it('should be able to search for instance', function(next){
        mri.once("post-method",function(req,res,mvc,result){
          res.send(JSON.stringify(result));
        })
        request.post(
          'http://localhost:3000/DummyModel/!search',
          {form:{a_string:"counter1"}},
          function (error, response, body){
            if(error){
              return next(error);
            }
            if(response.statusCode != 200)
              return next(new Error(body));
            try{
              assert.equal(response.statusCode,200);
              assert.equal(JSON.parse(body).length,5);
            }catch(e){
              return next(e);
            }
            next();
          }
        );
      });
    });
    it('should be able to delete an instance', function(next){
      mri.once("post-method",function(req,res,mvc,result){
        res.send(JSON.stringify(result.toJSON()));
      })
      request.post(
        'http://localhost:3000/DummyModel/'+instance._id+'/!delete',
        {form:{}},
        function (error, response, body){
          if(error){
            return next(error);
          }
          if(response.statusCode != 200)
            return next(new Error(body));
          try{
            assert.equal(response.statusCode,200);
            assert.equal(JSON.parse(body)._id,instance._id);
          }catch(e){
            return next(e);
          }
          next();
        }
      );
    });





  });
  after(function(){
    mongoose.connection.db.dropDatabase();
  })


})
/*
var mri2;
describe('RouteEmitter',function(){
  it('We should be able to give it no config file', function(){
    mri2 = new Maroop({
      error:{verbose:}
    });
  });
})
*/

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})
