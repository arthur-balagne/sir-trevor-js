
var d3 = require('d3');
var d3plus = require('d3plus');

var Chart = function(params) {
    this.init(params);
};


Chart.prototype = {
    init: function(params) {
        this.shape = d3plus.viz()
        .container('#' + params.block.blockID + ' .' + params.$elem.attr('class'))
        .data(params.data)
        .type(params.type)
        .x(params.x)
        .y(params.y)

        if (params.type === 'pie') {
            this.shape.size(params.y);
            this.shape.id(params.id);
        }
        if (params.type === 'bar') {
            this.shape.id(params.id)
        }

        console.log(params);
    },
    render: function() {
        this.shape.draw();
    },
    destroy: function() {
        this.shape = undefined;
    }
};

module.exports = Chart;
