var dd = require("react-dd");
var React = require("react");
var radio = require("radio");
var RadioMixin = require("../RadioMixin");

var List = dd.createClass({
  mixins: [RadioMixin],
  getInitialState: function(){
    return {items: []};
  },
  RadioMixin_setup: function(){
    return {
      Add_item: function(item){
        this.setState({items: this.state.items.concat([item])});
      }
    };
  },
  render: function(){
    var items = this.state.items;

    return dd.div(null,
      "List of items:",
      dd.ul(null,
        items.map(function(item, i){
          return dd.li({key: i},
            item
          );
        })
      )
    );
  }
});

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
      dd.p(null,
        dd.a({href: "#", onClick: this.__toggle},
          show_list ? "hide" : "show"
        )
      ),
      show_list ? List() : null
    );
  }
});

radio("Add_item").subscribe(function(){
  console.log("Add_item", arguments);
});

var count = 0;
setInterval(function(){
  count += 1;
  radio("Add_item").broadcast(count);
}, 1000);

React.render(App(), document.body);
