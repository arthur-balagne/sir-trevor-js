'use strict';

/*
  Chart Block
*/

var Block        = require('../block');
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

function tableUpdated(tableBuilder, block) {
    var $chart = block.$inner.find('.st__chart');
    var chartBuilder;
    tableBuilder.on('table:updated', function() {
        chartBuilder = new ChartBuilder({
            data: this.data,
            type: this.chartType,
            block: block,
            id: 'name',
            x: 'column',
            y: 'value',
            $elem: $chart
        });

        var toSave = {
            dataList: this.data,
            type: this.chartType,
            columns: this.columnsCount,
            categories: this.categoriesCount
        };
        Object.assign(this.block.blockStorage.data, toSave);
        chartBuilder.render();

    });
}

function onChoose(choices) {
    var chartType = choices.chartType;
    var $table = this.$inner.find('.st__chart-table');

    var tableBuilder = new TableBuilder({
        chartType: chartType,
        block: this,
        data: [],
        $elem: $table
    });

    tableUpdated(tableBuilder, this);
}

module.exports = Block.extend({

    chooseable: true,

    type: 'Chart',

    title: function() {
        return 'Chart';
    },

    editorHTML: '<div class="st__chart-informations"></div><div class="st__chart"></div><div class="st__chart-table"></div>',

    icon_name: 'chartpie',

    loadData: function(data) {
        var $table = this.$inner.find('.st__chart-table');

        var tableBuilder = new TableBuilder({
            chartType: data.type,
            block: this,
            data: data.dataList,
            $elem: $table
        });
        tableBuilder.columnsCount = data.columns;
        tableBuilder.categoriesCount = data.categories;
        this.tableBuilder = tableBuilder;
    },

    onBlockRender: function() {
        if (this.tableBuilder) {

            this.tableBuilder.render();
            tableUpdated(this.tableBuilder, this);
        }
        else {
            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    }
});
