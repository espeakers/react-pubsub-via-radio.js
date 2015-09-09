var radio = require('radio');

module.exports = {
  componentDidMount: function(){
    if(!this.RadioMixin_setup){
      console.warn("RadioMixin expects you to define a method called RadioMixin_setup");
      return;
    }
    this.RadioMixin_unsubscribe_fns = [];
    var s = this.RadioMixin_setup();
    var self = this;
    Object.keys(s).forEach(function(chanel){
      var fn = function(){
        s[chanel].apply(self, arguments);
      };
      radio(chanel).subscribe(fn);
      self.RadioMixin_unsubscribe_fns.push(function(){
        radio(chanel).unsubscribe(fn);
      });
    });
  },
  componentWillUnmount: function(){
    this.RadioMixin_unsubscribe_fns.forEach(function(fn){
      fn();
    });
  }
};
