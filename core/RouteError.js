

function RouteError(message) {
  if(typeof message == "string"){
    this.constructor.prototype.__proto__ = Error.prototype // Make this an instanceof Error.
    Error.call(this) // Does not seem necessary. Perhaps remove this line?
    Error.captureStackTrace(this, this.constructor) // Creates the this.stack getter
    this.name = this.constructor.name; // Used to cause messages like "UserError: message" instead of the default "Error: message"
    this.message = message; // Used to set the message
  }else if(message instanceof Error){
    this.constructor.prototype.__proto__ = message.constructor.prototype
    for(var i in message)
      this[i] = message[i];
    this.name = this.constructor.name;
  }
}

module.exports = RouteError;
