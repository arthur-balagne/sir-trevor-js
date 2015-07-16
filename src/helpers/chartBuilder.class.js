var d3     = require('d3');
var d3plus = require('d3plus');


var informationsTemplate = [
    '<div class="title">',
        '<input type="texte" placeholder="' + i18n.t('blocks:chart:title') + '" name="chart-name">',
    '</div>',

    '<div class="size">',
        '<label for="chart-width">' + i18n.t('blocks:chart:width') + '</label> <input type="number" value="960" name="chart-width">',
        '<label for="chart-height">' + i18n.t('blocks:chart:height') + '</label> <input type="number" value="320" name="chart-height">',
    '</div>'

].join('\n');

var pieFormat = [
    '<div class="numbered">',
        '<label for="numbered-select">' + i18n.t('blocks:chart:width') + '</label> ', // type d'affichage
        '<select class="numbered-select" name="numbered-select">',
            '<option value="text">Texte</option>',
            '<option value="number">Chiffre</option>',
        '</select>',
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

var Chart = function(params) {
    this.init(params);
};

Chart.prototype = {
    init: function(parameters) {
        this.block = parameters.block;
        this.$inner = parameters.block.$inner;
        this.blockType = parameters.type;

        this.shape = d3plus.viz()
        .container('#' + parameters.block.blockID + ' .' + parameters.$elem.attr('class'))
        .data(parameters.data)
        .type(parameters.type)
        .x({
            value: parameters.x,
            label: 'Colonnes'
        })
        .format({
            'text': function(text, params) {
                if (text === 'value') {
                  return i18n.t('blocks:chart:value');
                }
                return d3plus.string.title(text, params);
            }
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
            this.shape.size(parameters.y);

            if (parameters.display !== undefined) {
                if (parameters.display === 'number') {
                    this.shape.id('value');
                }
                else {
                    this.shape.id('column');
                }
            }
            else {
                this.shape.id(parameters.x);
            }

        }
        var that = this;
        this.block.$el.find('.numbered-select').on('change', function() {
            display = this.value;
            that.redraw(display);
            that.block.blockStorage.data.display = display;
        });
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

            if (this.blockType === 'pie') {
                this.$informations.append(pieFormat);

                var that = this;
                this.$informations.find('.numbered-select').on('change', function() {
                    display = this.value;
                    that.redraw(display);
                    that.block.blockStorage.data.display = display;
                });
            }
        }
        this.shape.draw();

    },
    redraw: function(display){
        if (display === 'number') {
            this.shape.id('value');
        }
        else {
            this.shape.id('column');
        }
        this.shape.draw();
    },
    destroy: function() {
        this.shape = undefined;
    }
};

module.exports = Chart;
