var dd = require("react-dd");
var radio = require("radio");
var RadioServiceMixin = require("../RadioServiceMixin");

module.exports = dd.createClass({
  mixins: [RadioServiceMixin],
  RadioService_setup: function(){
    return {
      Save: {
        key: function(){
          console.log("SaveButton: key", arguments);
          return 1;
        },
        on: {
          waiting: function(){
            console.log("SaveButton: on waiting");
          },
          failed: function(error){
            console.log("SaveButton: on failed", error);
          },
          succeeded: function(data){
            console.log("SaveButton: on succeeded", data);
          }
        }
      }
    };
  },
  __save: function(e){
    e.preventDefault();
    radio("Save").broadcast("something");
  },
  render: function(){
    var s = this.state.Save;

    return dd.div(null,
      s.waiting
        ? "Saving..."
        : dd.button({onClick: this.__save}, "Save"),

      s.data
        ? dd.div(null, s.data)
        : null,

      s.error
        ? dd.div({style: {color: "red"}}, "Error: ", s.error)
        : null
    );
  }
});
