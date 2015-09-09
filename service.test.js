var test = require("tape");
var cuid = require('cuid');
var radio = require("radio");
var service = require("./service");
var toArray = require('to-array');

var recordHistory = function(channel){
  var history = [];
  ["", "_waiting", "_succeeded", "_failed"].forEach(function(c){
    radio(channel + c).subscribe(function(){
      history.push([channel + c].concat(toArray(arguments)));
    });
  });
  return history;
};

test("service: success", function(t){
  var channel = cuid();

  var history = recordHistory(channel);

  service(channel, function(data, callback){
    callback(null, "it worked!");
  });
  radio(channel).broadcast("foo");

  setTimeout(function(){
    t.deepEqual(history, [
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel + "_succeeded", '"foo"', "it worked!"]
    ]);
    t.end();
  }, 5);
});

test("service: failure", function(t){
  var channel = cuid();

  var history = recordHistory(channel);

  service(channel, function(data, callback){
    callback("error!");
  });
  radio(channel).broadcast("foo");

  setTimeout(function(){
    t.deepEqual(history, [
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel + "_failed", '"foo"', "error!"]
    ]);
    t.end();
  }, 5);
});

test("service: multiple calls waiting", function(t){
  var channel = cuid();

  var history = recordHistory(channel);

  service(channel, function(data, callback){
    setTimeout(function(){
      callback(null, data + ": done!");
    }, 4);
  });
  radio(channel).broadcast("foo");
  radio(channel).broadcast("foo");
  setTimeout(function(){
    radio(channel).broadcast("foo");
  }, 1);

  setTimeout(function(){
    t.deepEqual(history, [
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel + "_succeeded", '"foo"', "foo: done!"]
    ]);
    t.end();
  }, 5);
});

test("service: waiting, then not waiting", function(t){
  var channel = cuid();

  var history = recordHistory(channel);

  service(channel, function(data, callback){
    setTimeout(function(){
      callback(null, data + ": done!");
    }, 1);
  });
  radio(channel).broadcast("foo");
  radio(channel).broadcast("foo");

  setTimeout(function(){
    //at this point we shouldn't be waiting anymore
    radio(channel).broadcast("foo");
  }, 2);

  setTimeout(function(){
    t.deepEqual(history, [
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel + "_succeeded", '"foo"', "foo: done!"],

      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel + "_succeeded", '"foo"', "foo: done!"]
    ]);
    t.end();
  }, 5);
});

test("service: sending around objects", function(t){
  var channel = cuid();

  var history = recordHistory(channel);

  service(channel, function(data, callback){
    setTimeout(function(){
      callback(null, {response: ["data", "foo"]});
    }, 1);
  });
  radio(channel).broadcast({some: {nested: ["data"]}, ok: "yep"});
  radio(channel).broadcast({some: {nested: ["data"]}, ok: "yep"});

  setTimeout(function(){
    var key = JSON.stringify({some: {nested: ["data"]}, ok: "yep"});
    t.deepEqual(history, [
      [channel, {some: {nested: ["data"]}, ok: "yep"}],
      [channel + "_waiting", key],
      [channel, {some: {nested: ["data"]}, ok: "yep"}],
      [channel + "_waiting", key],
      [channel + "_succeeded", key, {response: ["data", "foo"]}]
    ]);
    t.end();
  }, 5);
});

test("service: custom key function", function(t){
  var channel = cuid();

  var history = recordHistory(channel);

  var keyFn = function(data){
    return data.ok;
  };

  service(channel, function(data, callback){
    setTimeout(function(){
      callback(null, {response: ["data", "foo"]});
    }, 1);
  }, keyFn);
  radio(channel).broadcast({ok: "yep", some: {nested: ["data"]}});
  radio(channel).broadcast({ok: "yep", some: ["other"]});

  setTimeout(function(){
    t.deepEqual(history, [
      [channel, {some: {nested: ["data"]}, ok: "yep"}],
      [channel + "_waiting", "yep"],
      [channel, {ok: "yep", some: ["other"]}],
      [channel + "_waiting", "yep"],
      [channel + "_succeeded", "yep", {response: ["data", "foo"]}]
    ]);
    t.end();
  }, 5);
});

test("service: separate concurent calls", function(t){
  var channel = cuid();

  var history = recordHistory(channel);

  service(channel, function(data, callback){
    setTimeout(function(){
      if(data === "foo"){
        callback(null, "got foo");
      }else if(data === "bar"){
        callback(null, "got bar");
      }else{
        callback("what is this: " + data);
      }
    }, 1);
  });
  radio(channel).broadcast("foo");
  radio(channel).broadcast("bar");
  radio(channel).broadcast("foo");
  radio(channel).broadcast("bar");
  radio(channel).broadcast("blah");

  setTimeout(function(){
    t.deepEqual(history, [
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel, "bar"],
      [channel + "_waiting", '"bar"'],
      [channel, "foo"],
      [channel + "_waiting", '"foo"'],
      [channel, "bar"],
      [channel + "_waiting", '"bar"'],
      [channel, "blah"],
      [channel + "_waiting", '"blah"'],
      [channel + "_succeeded", '"foo"', "got foo"],
      [channel + "_succeeded", '"bar"', "got bar"],
      [channel + "_failed", '"blah"', "what is this: blah"]
    ]);
    t.end();
  }, 5);
});
