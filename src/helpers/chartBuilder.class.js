var d3     = require('d3');
var d3plus = require('d3plus');

var Chart = function(params) {
    this.init(params);
};

var informationsTemplate = [
    '<div class="title">',
        '<input type="texte" placeholder="' + i18n.t('blocks:chart:title') + '" name="chart-name">',
    '</div>',

    '<div class="size">',
        '<label for="chart-width">' + i18n.t('blocks:chart:width') + '</label> <input type="number" value="960" name="chart-width">',
        '<label for="chart-height">' + i18n.t('blocks:chart:height') + '</label> <input type="number" value="320" name="chart-height">',
    '</div>'
    ].join('\n');

function getChartInformationsFields(chartBuilder) {
    return {
        $title: chartBuilder.$informations.find('[name="chart-name"]'),
        $width: chartBuilder.$informations.find('[name="chart-width"]'),
        $height: chartBuilder.$informations.find('[name="chart-height"]')
    };
}

function getChartInformationsFieldsValues(fields) {
    return {
        title: fields.$title.val(),
        width: parseInt(fields.$width.val()),
        height: parseInt(fields.$height.val())
    };
}

function getChartValues(chartBuilder) {
    var fields = getChartInformationsFields(chartBuilder);
    var values = getChartInformationsFieldsValues(fields);

    Object.assign(chartBuilder.block.blockStorage.data, values);
    return values;
}

function updateValues(chartBuilder) {
    var fields = getChartInformationsFields(chartBuilder);
    var storedDatas = chartBuilder.block.blockStorage.data;

    if (storedDatas.title) {
        fields.$title.val(storedDatas.title);
    }

    if (storedDatas.width) {
        fields.$width.val(storedDatas.width);
    }

    if (storedDatas.height) {
        fields.$height.val(storedDatas.height);
    }
}

function saveTitle(chartBuilder) {
    var fields = getChartInformationsFields(chartBuilder);
    var values = getChartInformationsFieldsValues(fields);

    chartBuilder.block.blockStorage.data.title = values.title;
}

function bindListenersToFields(chartBuilder) {
    var fields = getChartInformationsFields(chartBuilder);
    fields.$title.on('change', function(){
        saveTitle(chartBuilder);
    });

    fields.$width.on('change', function(){
        var sizes = getChartValues(chartBuilder);
        chartBuilder.resizeX(sizes);
    });

    fields.$height.on('change', function(){
        var sizes = getChartValues(chartBuilder);
        chartBuilder.resizeY(sizes);
    });
}

Chart.prototype = {
    init: function(parameters) {
        this.block = parameters.block;
        this.$inner = parameters.block.$inner;

        this.shape = d3plus.viz()
        .container('#' + parameters.block.blockID + ' .' + parameters.$elem.attr('class'))
        .data(parameters.data)
        .type(parameters.type)
        .x({
            value: parameters.x,
            label: 'Colonnes'
        })
        .y({
            value: parameters.y,
            label: 'Valeurs'
        })
        .dev(false);

        if (parameters.type === 'bar') {
            this.shape.id(parameters.id);
        }

        if (parameters.type === 'pie') {
            this.shape.id(parameters.y);
            this.shape.size(parameters.y);
        }
    },

    resizeX: function(size) {
        this.shape.width(size.width);
        this.shape.draw();
    },

    resizeY: function(size) {
        this.shape.height(size.height);
        this.shape.draw();
    },

    render: function() {
        this.$informations = this.$inner.find('.st__chart-informations');

        if (this.$informations.children().length === 0) {
            this.$informations.append(informationsTemplate);
            updateValues(this);
            bindListenersToFields(this);
        }
        this.shape.draw();

    },
    destroy: function() {
        this.shape = undefined;
    }
};

module.exports = Chart;
