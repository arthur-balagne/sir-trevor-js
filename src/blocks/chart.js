'use strict';

/*
  Chart Block
*/

var Block        = require('../block');
var stToHTML     = require('../to-html');
var TableBuilder = require('../helpers/tableBuilder.class.js');
var ChartBuilder = require('../helpers/chartBuilder.class.js');




var chooseableConfig = {
    'name': 'chartType',
    'options': [
        {
            'icon': 'pie',
            'title': 'Camembert',
            'value': 'pie'
        },
        {
            'icon': 'bar',
            'title': 'Barre',
            'value': 'bar'
        }
    ]
};

function onChoose(choices) {
    var block = this;
    var chartType = choices.chartType;
    var $chart = block.$inner.find('.st__chart');
    var $table = block.$inner.find('.st__chart-table');
    var tableBuilder = new TableBuilder({
        chartType: chartType,
        block: block,
        data: [],
        $elem: $table
    });

    var chartBuilder;

    tableBuilder.on('table:updated', function() {
        chartBuilder = new ChartBuilder({
            data: this.data,
            type: this.chartType,
            block: block,
            id: 'name',
            x: 'column',
            y: 'value',
            $elem: $chart,
            title: '',
            width: '',
            height: ''
        });
        chartBuilder.render();
    });
}

module.exports = Block.extend({

    chooseable: true,

    type: 'Chart',

    title: function() {
        return 'Chart';
    },

    editorHTML: '<div class="st__chart"></div><div class="st__chart-table"></div>',

    icon_name: 'chartpie',

    loadData: function(data) {
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },

    beforeBlockRender: function() {
    },

    onBlockRender: function() {
        this.createChoices(chooseableConfig, onChoose.bind(this));
    }
});
