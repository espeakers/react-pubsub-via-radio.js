var radio = require("radio");
var toArray = require("to-array");
var RadioMixin = require("./RadioMixin");

var callServiceKey = function(service){
  return "RadioService_callService-key-" + service;
};

module.exports = {
  mixins: [RadioMixin],
  getInitialState: function(){
    var state = {};
    var s = this.__RadioService_setup();
    Object.keys(s).forEach(function(name){
      state[name] = {
        waiting: false,
        data: null,
        error: null
      };
      state[callServiceKey(name)] = null;
    });
    return state;
  },
  RadioService_setServiceState: function(name, new_state, onDone){
    var state = {};
    state[name] = new_state;
    this.setState(state, onDone);
  },
  Radio_setup: function(){
    var self = this;
    var channels = {};
    var updateState = this.RadioService_setServiceState;

    var s = this.__RadioService_setup();
    var callEventListener = function(name, event_name){
      if(s[name] && s[name].on && s[name].on[event_name]){
        s[name].on[event_name].apply(self, toArray(arguments, 2));
      }
    };

    Object.keys(s).forEach(function(name){
      var settings = s[name];
      if(!settings.key){
        console.warn('RadioServiceMixin expects each service you listen to have a "key" method');
        return;
      }
      var isMe = function(key){
        if(settings.key === "callService"){
          return self.state[callServiceKey(name)] === key;
        }
        return settings.key.apply(self) === key;
      };

      channels[name + "_waiting"] = function(key){
        if(!isMe(key))
          return;
        updateState(name, {waiting: true, data: null, error: null}, function(){
          callEventListener(name, "waiting");
        });
      };
      channels[name + "_succeeded"] = function(key, data){
        if(!isMe(key))
          return;
        updateState(name, {waiting: false, data: data, error: null}, function(){
          callEventListener(name, "succeeded", data);
        });
      };
      channels[name + "_failed"] = function(key, error){
        if(!isMe(key))
          return;
        updateState(name, {waiting: false, data: null, error: error}, function(){
          callEventListener(name, "failed", error);
        });
      };
    });

    return channels;
  },
  __RadioService_setup: function(){
    if(!this.RadioService_setup){
      console.warn("RadioServiceMixin expects you to define a method called RadioService_setup");
      return {};
    }
    if(!this.__RadioService_setup_cache){
      this.__RadioService_setup_cache = this.RadioService_setup();
    }
    return this.__RadioService_setup_cache;
  },
  RadioService_callService: function(service, params){
    var s = {};
    s[callServiceKey(service)] = JSON.stringify(params);
    this.setState(s, function(){
      radio(service).broadcast(params);
    });
  }
};
