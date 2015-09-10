var radio = require("radio");
var service = require("../service");

///////////////////////////////////////////////////

var count = 0;
setInterval(function(){
  count += 1;
  radio("Counted_a_new_number").broadcast(count);
}, 1000);

radio("Counted_a_new_number").subscribe(function(){
  console.log("Counted_a_new_number", arguments);
});

///////////////////////////////////////////////////

var to_error_or_not_to_error = false;
service("Save", function(data, callback){
  setTimeout(function(){
    if(to_error_or_not_to_error){
      callback("error!");
    }else{
      callback(null, "done!");
    }
    to_error_or_not_to_error = !to_error_or_not_to_error;
  }, 1000);
}, function(){
  return 1;
});
