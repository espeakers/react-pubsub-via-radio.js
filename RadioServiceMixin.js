var radio = require("radio");
var toArray = require("to-array");
var RadioMixin = require("./RadioMixin");

module.exports = {
  mixins: [RadioMixin],
  getInitialState: function(){
    var state = {};
    var s = this.__RadioServiceMixin_setup();
    Object.keys(s).forEach(function(name){
      state[name] = {
        waiting: false,
        data: null,
        error: null
      };
    });
    return state;
  },
  RadioServiceMixin_setServiceState: function(name, new_state, onDone){
    var state = {};
    state[name] = new_state;
    this.setState(state, onDone);
  },
  RadioMixin_setup: function(){
    var self = this;
    var channels = {};
    var updateState = this.RadioServiceMixin_setServiceState;

    var s = this.__RadioServiceMixin_setup();
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
  __RadioServiceMixin_setup: function(){
    if(!this.RadioServiceMixin_setup){
      console.warn("RadioServiceMixin expects you to define a method called RadioServiceMixin_setup");
      return {};
    }
    if(!this.__RadioServiceMixin_setup_cache){
      this.__RadioServiceMixin_setup_cache = this.RadioServiceMixin_setup();
    }
    return this.__RadioServiceMixin_setup_cache;
  }
};
