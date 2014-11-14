var mongoose = require("mongoose");
var help = require(__dirname+"/../core/helper.js");

  function processQuery(fields, schema){
    var query = {};
    var keys = Object.keys(schema.paths);
    for(var i=0;i<keys.length;i++){
      if(!(keys[i] in fields)){
        console.log("search: not here");
        continue;
      }
      if(/^_|\._/.test(keys[i])){
        console.log("search: hidden");
        continue
      }

      if(typeof query[keys[i]] == "undefined")
        query[keys[i]] = {};
      var type = help.findPathType(schema.paths[keys[i]]);
      if(type == "Number"){
	       for(var j = 0; j<fields[keys[i]].length;j++){
          switch(fields[keys[i]][j].meta){
          case "gt":
            query[keys[i]].$gt = fields[keys[i]][j].search;
            break;
          case "lt":
            query[keys[i]].$lt = fields[keys[i]][j].search;
            break;
          case "equal":
            query[keys[i]].$in = [fields[keys[i]][j].search];
            break;
          case "gte":
            query[keys[i]].$gte = fields[keys[i]][j].search;
            break;
          case "lte":
            query[keys[i]].$lte = fields[keys[i]][j].search;
            break
          }
        }
      }else if(type == "String"){
	      for(var j = 0; j<fields[keys[i]].length;j++){
          switch(fields[keys[i]][j].meta){
            case "equal":
            query[keys[i]].$in = [fields[keys[i]][j].search];
            break;
            case "regex":
            query[keys[i]].$regex = fields[keys[i]][j].search;
            break;
            case "in":
            query[keys[i]].$text = { $search: fields[keys[i]][j].search };
        }
      }
    }
  };
};
module.exports = function(req, res, mvc, next){
  /*
  var q = processQuery(req.body, mvc.model.schema);
  var sort = req.body._sort||"_id";
  var page = req.body._page||"0";

  var ipp = req.body._ipp||"25";
  */

  mvc.model.find(mvc.args).sort("_id")
  //.skip(page * ipp).limit(ipp)
  .exec(function(err, instances){
    if(err)
      return next(err);
    next(void(0),instances);
  });
};
