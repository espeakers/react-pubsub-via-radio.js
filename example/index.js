var dd = require("react-dd");
var React = require("react");

var CountStream = require("./CountStream");
var SaveButton = require("./SaveButton");

require("./model");//requiring this so that it will get loaded

var tabBtn = function(name, is_active, onClick){
  if(!is_active){
    return dd.a({
        href: "#",
        onClick: onClick,
        style: {
          display: "inline-block",
          padding: 20
        }
      },
      name
    );
  }
  return dd.span({style: {
      display: "inline-block",
      padding: 20,
      border: "1px solid black",
      borderBottom: "1px solid white",
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5
    }},
    name
  );
};

var App = dd.createClass({
  getInitialState: function(){
    return {show_list: true};
  },
  __toggle: function(e){
    e.preventDefault();
    this.setState({show_list: !this.state.show_list});
  },
  render: function(){
    var show_list = this.state.show_list;

    return dd.div(null,
      dd.div({style: {margin: "20px 20px -1px 30px"}},
        tabBtn("count stream", show_list, this.__toggle),
        tabBtn("save btn", !show_list, this.__toggle)
      ),
      dd.div({style: {
          padding: 20,
          margin: "0 20px 20px 20px",
          border: "1px solid black",
          borderRadius: 5
        }},
        show_list
          ? CountStream()
          : SaveButton()
      )
    );
  }
});

React.render(App(), document.body);
