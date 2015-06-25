'use strict';

/*
  Chart Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');
var Chart = require('chart.js');
var BarChart = require('../helpers/barChart.class.js');

var barChart = new BarChart();

barChart.init({
    labels: [ 'January']
});

barChart.createDataSet(
    {
        id : 1,
        label: 'My First dataset',
        fillColor: 'rgba(220,220,220,0.5)',
        strokeColor: 'rgba(220,220,220,0.8)',
        highlightFill: 'rgba(220,220,220,0.75)',
        highlightStroke: 'rgba(220,220,220,1)',
        data: [65]
    }
);
console.log(barChart.findDatasetById(1));
console.log(barChart.validate());
barChart.updateDataSetDatas(1, [ 65, 59, 80, 81, 56, 55, 40, 25 ]);
barChart.updateLabels([ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August']);

console.log(barChart.validate());
if(barChart.validate()){
    var labelsTpl = barChart.renderLabels();
    console.log(labelsTpl);
}

debugger;


var chartData = {
    Bar: {
        labels: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'],
        datasets: [
            {
                label: 'My First dataset',
                fillColor: 'rgba(220,220,220,0.5)',
                strokeColor: 'rgba(220,220,220,0.8)',
                highlightFill: 'rgba(220,220,220,0.75)',
                highlightStroke: 'rgba(220,220,220,1)',
                data: [ 65, 59, 80, 81, 56, 55, 40, 25 ]
            },
            {
                label: 'My Second dataset',
                fillColor: 'rgba(151,187,205,0.5)',
                strokeColor: 'rgba(151,187,205,0.8)',
                highlightFill: 'rgba(151,187,205,0.75)',
                highlightStroke: 'rgba(151,187,205,1)',
                data: [ 28, 48, 40, 19, 86, 27, 90, 56 ]
            }
        ]
    },
    Pie: [
        {
            value: 300,
            color: '#F7464A',
            highlight: '#FF5A5E',
            label: 'Red'
        },
        {
            value: 50,
            color: '#46BFBD',
            highlight: '#5AD3D1',
            label: 'Green'
        },
        {
            value: 100,
            color: '#FDB45C',
            highlight: '#FFC870',
            label: 'Yellow'
        }
    ]
};

var chooseableConfig = {
    'name': 'chartType',
    'options': [{
        'icon': 'pie',
        'title': 'Camembert',
        'value': 'Pie'
    }, {
        'icon': 'bar',
        'title': 'Barre',
        'value': 'Bar'
    }]
};

function onChoose(choices) {
    var block = this;

    var chartType = choices.chartType;
    var $chart = block.$inner.find('.chart');
    var ctx = $chart.get(0).getContext('2d');

    $chart.parent().addClass('active');

    var generatedChart = new Chart(ctx)[chartType](chartData[chartType]);
}

module.exports = Block.extend({

    chooseable: true,

    type: 'Chart',

    title: function() {
        return 'Chart';
    },

    editorHTML: '<div class="st__chart"><canvas class="chart" width="400px" height="400px"></canvas></div>',

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
