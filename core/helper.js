var mpath = require("mpath");

var utils = {
  dependentArray: require(__dirname+"/dependent-array"),
  object2URL: function(obj){
    if(obj.constructor.name == "model"){
      modelname = obj.constructor.modelName;
      return "/"+modelname+"/"+obj._id;
    }
    if("modelName" in obj)
      return "/"+obj.modelName;
    throw new Error("was not a document or a model");
  },
  fnURL: function(method){
    if(typeof method != "string")
      throw new Error("method needs to be a string");
    if(/^_/.test(method))
      throw new Error("If you want to make calls to hidden methods, you'll have to edit more");
    return "/!"+method;
  },
  getPathType: function(path){
    if(path.hasOwnProperty("caster")){
      return "Array"
    }else if(typeof path.instance != "undefined"){
      return path.instance;
    }else
      return path.options.type.name;
  },
  strip_and_applyInstance: function(fields, paths, instance){
    var keys = Object.keys(paths);
    for(var i=0;i<keys.length;i++){
      if(typeof fields[keys[i]] == "undefined")
        continue;
      if(/^_|.*\._|.*_\.|_$/.test(keys[i]))
        continue;
      mpath.set(keys[i], fields[keys[i]], instance);
    }
  },
  getArgs: function(func){
    fnStr = func.toString();
    fnStr = fnStr.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');
    result = fnStr.slice(
        fnStr.indexOf('(')+1,
        fnStr.indexOf(')')
      ).match(/([^\s,]+)/g);
    if(result === null)
      result = [];
    return result;
  },
  restrict: function(poss,total){
    var ret = {};
    for(var i=0;i<poss.length;i++){
      if(poss[i] in total)
        ret[poss[i]] =total[poss[i]];
    }
    return ret;
  }

};

module.exports = utils;
