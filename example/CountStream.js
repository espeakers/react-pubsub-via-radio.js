var dd = require("react-dd");
var RadioMixin = require("../RadioMixin");

module.exports = dd.createClass({
  mixins: [RadioMixin],
  getInitialState: function(){
    return {numbers: []};
  },
  Radio_setup: function(){
    return {
      "Counted_a_new_number": function(n){
        this.setState({numbers: this.state.numbers.concat([n])});
      }
    };
  },
  render: function(){
    var numbers = this.state.numbers;

    return dd.div(null,
      "The numbers this component has seen:",
      dd.ul(null,
        numbers.map(function(n, i){
          return dd.li({key: i},
            n
          );
        })
      )
    );
  }
});
