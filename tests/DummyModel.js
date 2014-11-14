var mongoose = require("mongoose");
var Schema = mongoose.Schema

var StringSchema = new Schema({
  a_string:String,
  a_string_array:[String],
  a_string_enum:{
    type: String,
    enum: ["a", "b","c"],
    default: "a"
  },
});

StringSchema.methods.syncMethod = function(){
  return "SyncMethod Success";
};

StringSchema.methods.asyncMeth = function(next){
  next(void(0),"AsyncMethod Success");
};

StringSchema.statics.syncStatic = function(req,res){
  if(req && res)
    return "Static Method with req and res";
  else
    throw Error("Issue in Sync Method");
};

StringSchema.statics.asyncStatic = function(str1,str2,str3,next){
  for(var i=0;i<3;i++){
    if(arguments[i] != "string"+(i+1))
      return next(new Error("Bad parameters"));
  }
  next(void(0),["No","issue","in","your","async","method"]);
};


module.exports = mongoose.model('DummyModel', StringSchema);
