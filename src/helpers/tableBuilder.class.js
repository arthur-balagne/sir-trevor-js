var _            = require('../lodash');
var $            = require('jquery');
var eventablejs  = require('eventablejs');


var tableTemplate = '<table class="chart-table"><%= headers %><%= content %> </table>';

var rowTemplate = '<tr><%= th %><%= tr %></tr>';
var cellTemplate = '<td data-xaxis="<%= xAxis %>" data-type="cell" data-yaxis="<%= yAxis %>" contenteditable><%= value %></td>';

var barParams = [
    {
        name: 'column-1',
        column: 'category1',
        value: 8,
        xAxis: 1,
        yAxis: 1
    },
    {
        name: 'column-1',
        column: 'category2',
        value: 9,
        xAxis: 1,
        yAxis: 2
    },

    {
        name: 'column-2',
        column: 'category1',
        value: 10,
        xAxis: 2,
        yAxis: 1
    },
    {
        name: 'column-2',
        column: 'category2',
        value: 3,
        xAxis: 2,
        yAxis: 2
    }
];

var pieParams = [
    {
        name: 'column-1',
        column: 'category1',
        value: 8,
        xAxis: 1,
        yAxis: 1
    },
    {
        name: 'column-2',
        column: 'category1',
        value: 9,
        xAxis: 2,
        yAxis: 1
    }
];

function createTableCell(element){
    return _.template(cellTemplate, element);
}

function createTableXaxisHeader(headersTable) {
    var headers = '<tr><th></th>';
    headersTable.forEach(function(element, key) {
        headers += '<th><input type="text" class="xaxis" data-xaxis="' + (key + 1) + '" value="' + element + '"><span data-xaxis="' + (key + 1) + '" class="remove-col"> - </span></th>';
    });
    headers += '</tr>';
    return headers;
}


function buildTable(params, tableBuilder) {
    var header = createTableXaxisHeader(tableBuilder.columnsHeaderValues);
    var rows = '';

    for (var i = 1; i <= tableBuilder.categoriesCount; i++) {
        var tr = '';

        for (var j = 1; j <= tableBuilder.columnsCount; j++) {
            params.forEach(function(paramElement) {
                if (j === paramElement.xAxis && i === paramElement.yAxis) {
                    tr += createTableCell(paramElement);
                }
            });
        }

        var th = _.template('<th> <input class="yaxis" data-yaxis="<%= id %>" value="serie<%= id %>" > <span data-yaxis="<%= id %>" class="remove-row">-</span></th>', {
            id: i
        });

        rows += _.template(rowTemplate, {
            tr: tr,
            th: th
        });
    }

    var table = _.template(tableTemplate, {
        content: rows,
        headers: header
    });
    return table;
}

function addControls(tableBuilder) {
    if (tableBuilder.columnModifiable === true) {
        var addCol = '<span class="control add-col"> ' + i18n.t('blocks:chart:col+') + ' </span>';
    }
    else {
        addCol = ' ';
    }

    if (tableBuilder.rowModifiable === true) {
        var addRow = '<span class="control add-row"> ' + i18n.t('blocks:chart:row+') + ' </span>';
    }
    else {
        addRow = ' ';
    }

    var controls = _.template('<div class="table-controls"><%= row %><%= cell %></div>', {
        row: addRow,
        cell: addCol
    });

    tableBuilder.$elem.append(controls);
}


function addControlsListenners(tableBuilder) {
    tableBuilder.$elem.find('.add-col').on('click', function(ev) {
        ev.stopPropagation();
        tableBuilder.addColumn();
    });

    tableBuilder.$elem.find('.add-row').on('click', function(ev) {
        ev.stopPropagation();

        tableBuilder.addRow();
    });

    tableBuilder.$elem.find('.remove-col').on('click', function(ev) {
        ev.stopPropagation();

        var dataName = $(this).data('xaxis');
        tableBuilder.deleteColumn(dataName);
    });

    tableBuilder.$elem.find('.remove-row').on('click', function(ev) {
        ev.stopPropagation();

        var column = $(this).data('yaxis');
        tableBuilder.deleteRow(column);
    });

}
function updateLabel(labelPosition, labelValue, arrayOflabels) {
    arrayOflabels[labelPosition] = labelValue;
    return arrayOflabels;
}

function addLabelsListenners(tableBuilder) {
    $.each(tableBuilder.$elem.find('.xaxis'), function(key) {
        $(this).on('keyup', function() {
            var inputValue = $(this).val();
            tableBuilder.columnsHeaderValues = updateLabel(key, inputValue, tableBuilder.columnsHeaderValues);
        }).on('blur', function() {
            tableBuilder.data = tableBuilder.getDatas();
            tableBuilder.trigger('table:updated');
        });
    });


    $.each(tableBuilder.$elem.find('.yaxis'), function(key) {
        $(this).on('keyup', function() {
            var inputValue = $(this).val();
            tableBuilder.rowsHeaderValues = updateLabel(key, inputValue, tableBuilder.rowsHeaderValues);
        })
        .on('blur', function() {
            tableBuilder.data = tableBuilder.getDatas();
            tableBuilder.trigger('table:updated');
        });
    });
}

function removeControlsListenners(tableBuilder) {
    tableBuilder.$elem.find('.add-col').off('click');
    tableBuilder.$elem.find('.add-row').off('click');

    tableBuilder.$elem.find('.remove-col').off('click');
    tableBuilder.$elem.find('.remove-row').off('click');


}

function stopWatchChanges(tableBuilder) {
    tableBuilder.$scope.off('keyup', 'td');
}


function watchChanges(tableBuilder) {

    tableBuilder.$scope.on('keyup', 'td', function(ev) {
        ev.preventDefault();

        tableBuilder.data = tableBuilder.getDatas();

        tableBuilder.trigger('table:updated', this.data);
    });
}

var TableBuilder = function(params) {
    this.init(params);
};

var prototype = {
    init: function(params) {
        this.chartType = params.chartType;
        this.data = params.data;
        this.$elem = params.$elem;
        this.block = params.block;
        this.columnsHeaderValues = params.columnsHeaderValues !== undefined ? params.columnsHeaderValues : [ 'colonne 1', 'colonne 2' ];
        this.rowsHeaderValues = params.rowsHeaderValues !== undefined ? params.rowsHeaderValues : [ 'serie 1', 'serie 2' ];

        this.prepare();
        this.render();
        addLabelsListenners(this);
    },

    getDatas: function() {
        var params = [];
        var $catArray = this.$scope.find('[data-type="cell"]');
        var that = this;
        $.each($catArray, function() {
            var obj = {
                value: parseInt($(this).html()),
                xAxis: parseInt($(this).data('xaxis')),
                yAxis: parseInt($(this).data('yaxis'))
            };
            obj.name = that.rowsHeaderValues[obj.yAxis - 1];
            obj.column = that.columnsHeaderValues[obj.xAxis - 1];
            params.push(obj);
        });
        return params;
    },

    addColumn: function() {
        var datas = [];

        this.columnsHeaderValues.push('colonne' + (this.columnsCount + 1));

        for (var i = 1; i <= this.categoriesCount; i++) {
                datas.push({
                name: this.columnsHeaderValues[this.columnsCount - 1],
                column: this.rowsHeaderValues[i - 1],
                value: 0,
                xAxis: this.columnsCount + 1,
                yAxis: i
            });
        }

        this.columnsCount++;

        if (this.data.length === 0) {
            this.data = this.getDatas();
        }

        this.data = this.data.concat(datas);
        this.render();
        addLabelsListenners(this);
        stopWatchChanges(this);
        watchChanges(this);
    },

    addRow: function() {
        var datas = [];

        this.rowsHeaderValues.push('serie ' + (this.categoriesCount + 1));
        for (var i = 1; i <= this.columnsCount; i++) {
                datas.push({
                name: this.rowsHeaderValues[this.categoriesCount - 1],
                column: this.rowsHeaderValues[i - 1],
                value: 0,
                xAxis: i,
                yAxis: this.categoriesCount + 1
            });
        }
        this.categoriesCount++;

        if (this.data.length === 0) {
            this.data = this.getDatas();
        }

        this.data = this.data.concat(datas);

        this.render();
        stopWatchChanges(this);
        addLabelsListenners(this);
        watchChanges(this);

    },

    deleteRow: function(rowNumber) {
        if (this.categoriesCount - 1 < this.minCategoriesCount) {
            this.block.addMessage(i18n.t('blocks:chart:no-deletion-col'), 'st-block-displaying-message');
            var that = this;
            window.setTimeout(function() {
                that.block.resetMessages();
                }, 3000
            );
            return;
        }

        this.data = this.data.filter(function(elem) {
            if (elem.yAxis > rowNumber) {
                elem.yAxis--;
                return true;
            }
            return elem.yAxis !== rowNumber;
        });

        this.rowsHeaderValues = this.rowsHeaderValues.filter(function(elem, key) {

            return key !== (rowNumber - 1);
        });

        this.categoriesCount--;

        this.render();
        this.trigger('table:updated', this.data);

        addLabelsListenners(this);
        stopWatchChanges(this);
        watchChanges(this);

    },

    deleteColumn: function(colNumber) {

        if (this.columnsCount - 1 < this.minColumnsCount) {
            this.block.addMessage(i18n.t('blocks:chart:no-deletion-line'), 'st-block-displaying-message');
            var that = this;
            window.setTimeout(function() {
                that.block.resetMessages();
                }, 3000
            );
            return;
        }
        this.datas = this.getDatas();


        this.data = this.data.filter(function(elem) {
            if (elem.xAxis > colNumber) {
                elem.xAxis--;
                return true;
            }
            return elem.xAxis !== colNumber;
        });

        this.columnsHeaderValues = this.columnsHeaderValues.filter(function(elem, key) {
            return (key + 1) !== colNumber;
        });

        this.columnsCount--;

        this.trigger('table:updated', this.data);
        this.render();

        addLabelsListenners(this);
        stopWatchChanges(this);
        watchChanges(this);

    },
    prepare: function() {
        var tableHtml;
        if (this.chartType === 'bar') {
            this.minColumnsCount = 2;
            this.minCategoriesCount = 2;
            if (this.data.length === 0) {

                this.columnsCount = this.minColumnsCount;
                this.categoriesCount = this.minCategoriesCount;

                tableHtml = buildTable(barParams, this);

            }
            else {
                tableHtml = buildTable(this.data, this);
            }

            this.columnModifiable = true;
            this.rowModifiable = true;

        }

        if (this.chartType === 'pie') {
            this.minColumnsCount = 2;
            this.minCategoriesCount = 1;

            if (this.data.length === 0) {
                this.columnsCount = this.minColumnsCount;
                this.categoriesCount = this.minCategoriesCount;

                tableHtml = buildTable(pieParams, this);
            }
            else {
                tableHtml = buildTable(this.data, this);
            }


            this.columnModifiable = true;
            this.rowModifiable = false;

        }

        if (this.$elem.length !== 0) {
            this.$elem.empty();
        }

        addControls(this);

        return tableHtml;
    },

    render: function() {
        var tableHtml = this.prepare();

        this.$elem.append(tableHtml);
        this.$scope = this.$elem.find('.chart-table');
        addControlsListenners(this);
        watchChanges(this);
    },

    destroy: function(){
        removeControlsListenners(this);
    }
};

TableBuilder.prototype = Object.assign({}, prototype, eventablejs);

module.exports = TableBuilder;
