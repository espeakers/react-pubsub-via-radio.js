var radio = require('radio');

module.exports = {
  componentDidMount: function(){
    if(!this.Radio_setup){
      console.warn("RadioMixin expects you to define a method called Radio_setup");
      return;
    }
    this.__Radio_unsubscribe_fns = [];
    var s = this.Radio_setup();
    var self = this;
    Object.keys(s).forEach(function(chanel){
      var fn = function(){
        s[chanel].apply(self, arguments);
      };
      radio(chanel).subscribe(fn);
      self.__Radio_unsubscribe_fns.push(function(){
        radio(chanel).unsubscribe(fn);
      });
    });
  },
  componentWillUnmount: function(){
    this.__Radio_unsubscribe_fns.forEach(function(fn){
      fn();
    });
  }
};
