var dd = require("react-dd");
var RadioServiceMixin = require("../RadioServiceMixin");

module.exports = dd.createClass({
  mixins: [RadioServiceMixin],
  RadioService_setup: function(){
    return {
      SaveData: {
        key: "callService"
      }
    };
  },
  __save: function(e){
    e.preventDefault();
    this.RadioService_callService("SaveData", {some: "data"});
  },
  render: function(){
    var s = this.state.SaveData;

    return dd.div(null,
      s.waiting
        ? "Saving..."
        : dd.button({onClick: this.__save}, "Save"),

      s.data
        ? dd.pre(null, JSON.stringify(s.data, false, 2))
        : null,

      s.error
        ? dd.div({style: {color: "red"}}, "Error: ", s.error)
        : null
    );
  }
});
