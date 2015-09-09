var radio = require('radio');

var defaultKeyFn = function(data){
  return JSON.stringify(data);
};

module.exports = function(name, callback, keyFn){
  keyFn = keyFn || defaultKeyFn;

  radio(name).subscribe((function(){
    var ajax_waiting = {};

    return function(data){
      var key = keyFn(data);

      radio(name + '_waiting').broadcast(key);
      if(ajax_waiting[key] === true){
        return;
      }
      ajax_waiting[key] = true;

      callback(data, function(err, resp){
        if(err){
          radio(name + '_failed').broadcast(key, err);
        }else{
          radio(name + '_succeeded').broadcast(key, resp);
        }
        ajax_waiting[key] = false;
      });
    };
  }()));
};
