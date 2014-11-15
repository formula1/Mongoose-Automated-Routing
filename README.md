Mongoose-Automated-Routing
==========================

I'm attempting to seperate https://github.com/formula1/node-mongoose-jumpstart into two or more repositories.
That project is far to gigantic for my and its own sake. Its good to keep in mind when things get too big.

# Purpose

I hate busy work. I hate repeating myself. I'd prefer focusing on problems that actually need to be solved such as
data structures, customization and building for the future. No offesnse to routing, but its dumb. I don't believe I
or anyone should have to spend 15, 20 or more hours making sure everything is routed properly. This is busy work
This is menial labour. This is the kind of stuff that would be "hours filler" Where I can get paid extra cash for doing
a boring yet necessary task. 

> But I do not want to do boring yet necessary tasks. Thats why we have machines

Machines do not feel, I think. And so, they do not know that their actions are boring. They simply just do their task 
while I can move on with life to bigger better things. Unfortunately this is still wip. 

# API

##Initialization

I need to play with it more to make sure the initializations work

## Events

The Core of it is an EventEmitter, currently a Syncronous EventEmitter so Usually You will not have a next argument
The events are as follows
* **pre-process** (req,mvc) - This happens before anything else happens. At this point `mvc` is an empty object
* **pre-built** (req,mvc) - This happens before we touch mongoose. Our `mvc` object has a .URL property which is just the parsed url with an "extension" as well. We've also declared whether or not we have a method
* **built** (req,mvc) - this happens when we actually built, it will be under {model,instance,subprop,method,args}
* **pre-method** *?* (req,res,mvc) - this happens before we run a specific method (only happens on method calls)
* **post-method** *?* (req,res,mvc,result) - this happens after we run a specific method (only happens on method calls)
* **render** (req,res,mvc,next) - this happens if everything else has been successful. At this point we no longer care about the request
* **error** *?* (err,req,res,mvc) - this will only happen if you don't provide a next to the main function and we get an error. Otherwise it will pass the error to next
* **404** *?* (req,res,mvc) - this will only happen if you don't provide a next to the main function and we get an error. Otherwise it will just run next;


## Methods

One of the most important thing about the mongoose models is the methods available. Like Java, we have instance and static methods.
We also have subproperty methods which are defined dynamicly. Unfortunately, nothing is type strict persay when it comes to
the arguments of the method, as a result I have to just do my best in terms of applying the correct argument based on names.

>Inorder to call a method, I'm using the notation of `/My/Path/To/Something/!method`
I'm considering making it like `/My/Path/To/Something/method!` so I can do `/My/Path/To/Something/method!extension` instead of `/My/Path/To/Something/!method.extension`
I could also do `/My/Path/To/Something!method.extension` Or even group up the method `/My/Path/To/Something/method` like that

The sky is the limit I suppose....

## Currently handled routes

* Model/
* Model/!Create
* Model/!Search
* Model/!(===Any Static Method===)
* Model/Instance
* Model/Instance/!Update
* Model/Instance/!Delete
* Model/Instance/!(===Any Instance Method===)
* Model/Instance/[SubProperty/]+ (You can have an number of nested sub properties)
* Model/Instance/[SubProperty/]+/!(===Any SubProperty Method===) (This is type and Class Specific, which the result may or may not exist)

**Any Method Can Be Syncronous or Asyncronous**
* Any method which you want to be asyncronous needs a (next|cb|callback|done) argument and we'll plop it in for you
* Any method which you want the original request, add in a (req|request) and we'll add it for you
* Any method which you want the original response, add in a (res|response) and we'll add it for you

## Hidden and Unsettables

Anything that begins with a _ is considered unusable except for _id.
This may be changed in the future to be __ while _ is just hidden from the user but still accessible

## Known Issues

* This thing is still sensitive. I'm confident you can break it
* It cannot handle arrays 
