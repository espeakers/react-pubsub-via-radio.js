# react-pubsub-via-radio.js
Some mixins and utilities to make radio.js publish/subscribe work smoothly with react.js

## radio
This library uses [radio.js](http://radio.uxder.com/) for publish/subscribe. You require it like this:
```js
var radio = require("react-pubsub-via-radio.js/radio");
```
Then just look at [their documentation](http://radio.uxder.com/documentation.html) to see how to use it.

## RadioMixin
This mixin allows your components to listen to radio events. It will make sure the listeners are subscribed on mount and unsubscribed on unmount.
```js
var RadioMixin = require("react-pubsub-via-radio.js/RadioMixin");
...
... React.createClass({
  mixins: [RadioMixin],
  ...
  Radio_setup: function(){
    return {
      "Some_Radio_Event": function(a, b, c){
        //now you can handle the event
        //"this" is bound to the component so you can use
        //this.setState(...) etc...
      }
    };
  },
  ...
  render: function(){
    ...
  }
});
...
radio("Some_Radio_Event").broadcast(1, 2, 3);
```

## RadioService
Use this when you want to represent some asynchronous service. This will subscribe to a channel then broadcast messages to notify others when it's done.
```js
var RadioService = require("react-pubsub-via-radio.js/service");

RadioService("Some_service", function(data, callback){

  //do some async work i.e. ajax

  //when you are done just call the callback
  //i.e.  callback(error, data);

}, function(data){
  //You can define a function that returns a "key"
  //that is unique to the action taking place
  //This way you wont have 5 of the same ajax call
  //all happening at once.
  //The key should be a number or string

  return data.id;//in this example we are returning data.id
                 //which ensures Some_service wont have
                 //concurrent calls all for the same id

  //If you don't define this it will default to
  // return JSON.stringify(data);
});
```
Here's a high level view of what's going on under the hood:
```js
//someone asks the service to do something
radio("Some_service").broadcast({id: 123, other: "data" ...});
...
...Now inside the RadioService...
//the service picks it up and broadcasts back
radio("Some_service_waiting").broadcast(123);
//The service does your async work
...
//Then when you callback(null, data)
radio("Some_service_succeeded").broadcast(123, data);
//Or if you callback(error)
radio("Some_service_failed").broadcast(123, error);
```

## RadioServiceMixin
This mixin makes working with RadioService easier. It will setup `this.state.<service name>` so you can observe the state of the service i.e. waiting, the data, or the error message. All you have to do is setup which services you subscribe to and the "key" for the instance of the service you are listening to.
```js
var RadioServiceMixin = require("react-pubsub-via-radio.js/RadioServiceMixin");
...
... React.createClass({
  mixins: [RadioServiceMixin],
  ...
  RadioService_setup: function(){
    return {
      "Some_service": {
        key: function(){
          //you must define this function to declare
          //which "key" of the service calls you
          //care about.
          return this.props.id;
        },
        on: {//optionally you can declare on event handlers
          waiting: function(){},
          succeeded: function(data){},
          failed: function(error){}
        }
      }
    };
  },
  ...
  RadioService_Radio_setup: function(){
    //same as the Radio_setup method in RadioMixin
  },
  ...
  render: function(){
    var s = this.state.Some_service;
    //this will contain the following properties
    // s.waiting - true/false
    // s.data    - null or the data returned by the service on success
    // s.error   - null or the error message returned by the service on failure

    ...
  }
});
```

### this.RadioService_callService(service, params)
This is a convenience function for calling a service you want to then listen to.
```js
  ...
  RadioService_setup: function(){
    return {
      "Some_service": {
        key: "callService"
      }
    };
  },
  ...
  someMethod: function(){
    ...
    this.RadioService_callService("Some_service", params)
  }
  ...
```
Under the hood this will json stringify `params` and use that as the key.

## Example
```sh
$ git clone https://github.com/espeakers/react-pubsub-via-radio.js.git
$ cd react-pubsub-via-radio.js/
$ npm i
$ npm start
```
Then it will tell you which port it's hosted on so you can open it in your browser.

The code for this is in the "example" directory.

## Installing
Install using [npm](https://www.npmjs.com/)
```sh
npm install --save react-pubsub-via-radio.js
```

## FYI

This project follows [semantic versioning](http://semver.org/) for releases.

# License

The MIT License (MIT)

Copyright (c) 2015 eSpeakers.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
