var dd = require("react-dd");
var React = require("react");

var tabs = {
  "count stream": require("./CountStream"),
  "save btn": require("./SaveButton"),
  "save data": require("./SaveData")
};

require("./model");//requiring this so that it will get loaded

var tabBtn = function(name, is_active, onClick){
  if(!is_active){
    return dd.a({
        key: name,
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
  return dd.span({key: name, style: {
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
    return {show_tab: Object.keys(tabs)[0]};
  },
  __clickTab: function(tab_name){
    var self = this;
    return function(e){
      e.preventDefault();
      self.setState({show_tab: tab_name});
    };
  },
  render: function(){
    var self = this;
    var show_tab = this.state.show_tab;

    return dd.div(null,
      dd.div({style: {margin: "20px 20px -1px 30px"}},
        Object.keys(tabs).map(function(tab_name){
          return tabBtn(tab_name, show_tab === tab_name, self.__clickTab(tab_name));
        })
      ),
      dd.div({style: {
          padding: 20,
          margin: "0 20px 20px 20px",
          border: "1px solid black",
          borderRadius: 5
        }},
        tabs[show_tab]()
      )
    );
  }
});

React.render(App(), document.body);
