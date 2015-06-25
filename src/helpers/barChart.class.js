var _ = require('../lodash');
var $ = require('jquery');


var BarChart = function() {

}

var labelsCreationTemplate = _.template([
    '<div class="colunm-container">',
        '<div class="help2">Entrez une valeur, une liste seras automatiquement crée (ex: "Janvier")</div>',
        '<ul class="list" >',
            '<li data-name="janvier" >',
                'Janvier <span><a class="delete" href="#">Supprimer<a></span>',
            '</li>',
        '</ul>',
        '<input class="list-input" type="text" placeholder="Entrez une nouvelle colone">',
        '<button class="add">Ajouter</button>',
            '<div><a class="validate" href="#">Terminer</a></div>',
    '</div>'
].join('\n'))

function countColumns(barchart){
    if (barchart.labels !== undefined) {
        return barchart.labels.length;
    }
}
function countDataSetValues(dataset){
    return dataset.data.length;
}
function createDataSet (params){
    return{
        label: params.label,
        fillColor: params.fillColor,
        strokeColor: params.strokeColor,
        highlightFill: params.highlightFill,
        highlightStroke: params.highlightStroke,
        data: []
    };
}

BarChart.prototype = {
    init: function(params) {
        this.dataSets = [];
        if(params.labels){
            this.labels = params.labels;
        }
    },
    createDataSet: function (params) {
        this.dataSets.push({
            id: params.id,
            label: params.label,
            fillColor: params.fillColor,
            strokeColor: params.strokeColor,
            highlightFill: params.highlightFill,
            highlightStroke: params.highlightStroke,
            data: params.data
        });
    },
    validate: function() {
        var valid = true;
        var labels = this.labels;
        var dataSets = this.dataSets;
        var that = this;
        Object.keys(dataSets).forEach(function(d){
            if (countDataSetValues(dataSets[d]) !== countColumns(that)) {
                valid = false;
            }
        });
        return valid;
    },
    findDatasetById: function(id) {
        var position = false;
        var dataSets = this.dataSets;
        Object.keys(dataSets).forEach(function(d) {

            if (dataSets[d].id === id) {
                position = d;
            }
        });
        return position;
    },
    updateDataSetDatas: function(datasetId, values) {
        var datasetToUpdate = this.findDatasetById(datasetId);
        if(datasetToUpdate){
            this.dataSets[datasetToUpdate].data = values
        }
    },
    updateLabels: function(labels) {
        this.labels = labels;
    },
    renderLabels: function(){
        var tpl = labelsCreationTemplate();

        $('.add').on('click', function(){
            var value = $('.list-input').val();
            if( value.length > 0) {
                $('.list').append('<li data-name="' + value + '" >' + value + '<span><a href="#">Supprimer<a></span></li>')
            }
            else {
                return;
            }
        });

        $('.delete').on('click', function(e){
            e.preventDefault();
            $(this).closest('li').remove();
        });

        $('.validate').on('click', function(e){
            e.preventDefault();
            var datas = [];
            var lis = $('.list').find('li');
            console.log(lis);
            $.each(lis, function(key, value){
                datas.push($(value).data('name'));
            });
        });
        return tpl;
    }

};

module.exports = BarChart;
