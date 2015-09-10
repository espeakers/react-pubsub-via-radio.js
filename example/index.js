var dd = require("react-dd");
var React = require("react");
var radio = require("radio");
var service = require("../service");
var RadioMixin = require("../RadioMixin");
var RadioServiceMixin = require("../RadioServiceMixin");

var SaveButton = dd.createClass({
  mixins: [RadioServiceMixin],
  RadioServiceMixin_setup: function(){
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
      SaveButton(),
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
